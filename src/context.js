import {
    omit,
    each,
    getPath,
    hasProp,
    safeValue,
    bindContext,
} from './utils.js'
import { isFunction, isString } from './type.js'
import { element } from './element.js'
import { EjsBuffer } from './buffer.js'

const PARENT = Symbol('EjsContext.parentTemplate')

const createContext = (config, methods) => {
    const {
        BLOCKS,
        MACRO,
        EXTEND,
        LAYOUT,
        BUFFER,
        SAFE,
        SCOPE,
        COMPONENT,
        ELEMENT,
    } = config.vars
    const globals = config.globals || []
    function EjsContext(data) {
        this[PARENT] = null
        this[BLOCKS] = {}
        this[MACRO] = {}
        Object.assign(
            this,
            omit(data, [SCOPE, BUFFER, SAFE, COMPONENT, ELEMENT]),
        )
    }
    Object.entries(methods).forEach(([name, value]) => {
        if (isFunction(value) && globals.includes(name)) {
            value = value.bind(EjsContext.prototype)
        }
        EjsContext.prototype[name] = value
    })
    Object.defineProperty(EjsContext.prototype, BUFFER, {
        value: EjsBuffer(),
    })
    Object.defineProperty(EjsContext.prototype, BLOCKS, {
        value: {},
        writable: true,
    })
    Object.defineProperty(EjsContext.prototype, MACRO, {
        value: {},
        writable: true,
    })
    Object.defineProperty(EjsContext.prototype, LAYOUT, {
        value: false,
        writable: true,
    })
    Object.defineProperty(EjsContext.prototype, EXTEND, {
        value: false,
        writable: true,
    })
    Object.defineProperty(EjsContext.prototype, PARENT, {
        value: null,
        writable: true,
    })
    Object.defineProperties(EjsContext.prototype, {
        /** @type {function} */
        setParentTemplate: {
            value(value) {
                this[PARENT] = value
                return this
            },
        },
        /** @type {function} */
        getParentTemplate: {
            value() {
                return this[PARENT]
            },
        },
        /** @type {function} */
        useSafeValue: {
            get: () => safeValue,
        },
        /** @type {function} */
        useComponent: {
            get() {
                if (isFunction(this[COMPONENT])) {
                    return this[COMPONENT].bind(this)
                } else {
                    return () => {
                        throw new Error(`${COMPONENT} must be a function`)
                    }
                }
            },
        },
        /** @type {function} */
        useElement: {
            get() {
                if (isFunction(this[ELEMENT])) {
                    return this[ELEMENT].bind(this)
                } else {
                    return () => {
                        throw new Error(`${ELEMENT} must be a function`)
                    }
                }
            },
        },
        /** @type {function} */
        useBuffer: {
            get() {
                return this[BUFFER]
            },
        },
        /** @type {function} */
        getMacro: {
            value() {
                return this[MACRO]
            },
        },
        /** @type {function} */
        getBlocks: {
            value() {
                return this[BLOCKS]
            },
        },
        /** @type {function} */
        setExtend: {
            value(value) {
                this[EXTEND] = value
                return this
            },
        },
        /** @type {function} */
        getExtend: {
            value() {
                return this[EXTEND]
            },
        },
        /** @type {function} */
        setLayout: {
            value(layout) {
                this[LAYOUT] = layout
                return this
            },
        },
        /** @type {function} */
        getLayout: {
            value() {
                return this[LAYOUT]
            },
        },
        /** @type {function} */
        clone: {
            value(exclude_blocks) {
                const filter = [LAYOUT, EXTEND, BUFFER]
                if (exclude_blocks === true) {
                    filter.push(BLOCKS)
                }
                return omit(this, filter)
            },
        },
        /** @type {function} */
        extend: {
            value(layout) {
                this.setExtend(true)
                this.setLayout(layout)
            },
        },
        /** @type {function} */
        echo: {
            value() {
                return [].slice.call(arguments).forEach(this.useBuffer)
            },
        },
        /** @type {function} */
        fn: {
            value(callback) {
                return () => {
                    if (isFunction(callback)) {
                        this.useBuffer.backup()
                        this.useBuffer(callback.apply(this, arguments))
                        return this.useBuffer.restore()
                    }
                }
            },
        },
        /** @type {function} */
        macro: {
            value(name, callback) {
                const list = this.getMacro()
                const macro = this.fn(callback)
                const context = this
                list[name] = function () {
                    return context.echo(macro.apply(undefined, arguments))
                }
            },
        },
        /** @type {function} */
        call: {
            value(name) {
                const list = this.getMacro()
                const macro = list[name]
                const params = [].slice.call(arguments, 1)
                if (isFunction(macro)) {
                    return macro.apply(macro, params)
                }
            },
        },
        /** @type {function} */
        block: {
            value(name, callback) {
                const blocks = this.getBlocks()
                blocks[name] = blocks[name] || []
                blocks[name].push(this.fn(callback))
                if (this.getExtend()) return
                const list = Object.assign([], blocks[name])
                const shift = () => list.shift()
                const next = () => {
                    const parent = shift()
                    if (parent) {
                        return () => {
                            this.echo(parent(next()))
                        }
                    } else {
                        return () => {}
                    }
                }
                this.echo(shift()(next()))
            },
        },
        /** @type {function} */
        hasBlock: {
            value(name) {
                return this.getBlocks().hasOwnProperty(name)
            },
        },
        /** @type {function} */
        include: {
            value(path, data, cx) {
                const context = cx === false ? {} : this.clone(true)
                const params = Object.assign(context, data || {})
                const promise = this.render(path, params)
                this.echo(promise)
            },
        },
        /** @type {function} */
        use: {
            value(path, namespace) {
                this.echo(
                    Promise.resolve(this.require(path)).then((exports) => {
                        const list = this.getMacro()
                        each(exports, (macro, name) => {
                            list[[namespace, name].join('.')] = macro
                        })
                    }),
                )
            },
        },
        /** @type {function} */
        async: {
            value(promise, callback) {
                this.echo(Promise.resolve(promise).then(callback))
            },
        },
        /** @type {function} */
        get: {
            value(name, defaults) {
                const path = getPath(this, name, true)
                const result = path.shift()
                const prop = path.pop()
                return hasProp(result, prop) ? result[prop] : defaults
            },
        },
        /** @type {function} */
        set: {
            value(name, value) {
                const path = getPath(this, name, false)
                const result = path.shift()
                const prop = path.pop()
                if (this.getParentTemplate() && hasProp(result, prop)) {
                    return result[prop]
                }
                return (result[prop] = value)
            },
        },
        /** @type {function} */
        each: {
            value(object, callback) {
                if (isString(object)) {
                    object = this.get(object, [])
                }
                each(object, callback)
            },
            writable: true,
        },
        /** @type {function} */
        el: {
            value(tag, attr, content) {
                content = isFunction(content) ? this.fn(content)() : content
                this.echo(
                    Promise.resolve(content).then((content) =>
                        element(tag, attr, content),
                    ),
                )
            },
            writable: true,
        },
        /** @type {function} */
        ui: {
            value(layout) {},
            writable: true,
        },
    })
    return EjsContext
}

export class Context {
    #context
    static exports = ['create', 'globals', 'helpers']
    constructor(options, methods) {
        bindContext(this, this.constructor.exports)
        this.configure(options, methods)
    }
    create(data) {
        return new this.#context(data)
    }
    helpers(methods) {
        Object.assign(this.#context.prototype, methods)
    }
    configure(options, methods) {
        this.#context = createContext(options, methods)
    }
}
