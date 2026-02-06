import {
    omit,
    each,
    getPath,
    hasProp,
    escapeValue,
    bindContext,
} from './utils.js'
import { isFunction, isString } from './type.js'
import { element } from './element.js'
import { EjsBuffer } from './buffer.js'

const PARENT = Symbol('EjsContext.parentTemplate')

const createContext = (config, methods) => {
    const globals = config.globals || []
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
    class Context {
        constructor(data) {
            this[PARENT] = null
            this[BLOCKS] = {}
            this[MACRO] = {}
            Object.assign(
                this,
                omit(data, [SCOPE, BUFFER, SAFE, COMPONENT, ELEMENT]),
            )
        }
    }
    Object.defineProperties(Context.prototype, {
        [BUFFER]: {
            value: EjsBuffer(),
        },
        [BLOCKS]: {
            value: {},
            writable: true,
        },
        [MACRO]: {
            value: {},
            writable: true,
        },
        [LAYOUT]: {
            value: false,
            writable: true,
        },
        [EXTEND]: {
            value: false,
            writable: true,
        },
        [PARENT]: {
            value: null,
            writable: true,
        },
        setParentTemplate: {
            value(value) {
                this[PARENT] = value
                return this
            },
        },
        getParentTemplate: {
            value() {
                return this[PARENT]
            },
        },
        useEscapeValue: {
            value() {
                return escapeValue
            },
        },
        useComponent: {
            value() {
                if (isFunction(this[COMPONENT])) {
                    return this[COMPONENT].bind(this)
                } else {
                    return function () {
                        throw new Error(`${COMPONENT} must be a function`)
                    }
                }
            },
        },
        useElement: {
            value() {
                if (isFunction(this[ELEMENT])) {
                    return this[ELEMENT].bind(this)
                } else {
                    return () => {
                        throw new Error(`${ELEMENT} must be a function`)
                    }
                }
            },
        },
        useBuffer: {
            value() {
                return this[BUFFER]
            },
        },
        getMacro: {
            value() {
                return this[MACRO]
            },
        },
        getBlocks: {
            value() {
                return this[BLOCKS]
            },
        },
        setExtend: {
            value(value) {
                this[EXTEND] = value
                return this
            },
        },
        getExtend: {
            value() {
                return this[EXTEND]
            },
        },
        setLayout: {
            value(layout) {
                this[LAYOUT] = layout
                return this
            },
        },
        getLayout: {
            value() {
                return this[LAYOUT]
            },
        },
        clone: {
            value(exclude_blocks) {
                const filter = [LAYOUT, EXTEND, BUFFER]
                if (exclude_blocks === true) {
                    filter.push(BLOCKS)
                }
                return omit(this, filter)
            },
        },
        extend: {
            value(layout) {
                this.setExtend(true)
                this.setLayout(layout)
            },
        },
        echo: {
            value() {
                return [].slice.call(arguments).forEach(this.useBuffer())
            },
        },
        fn: {
            value(callback) {
                const buffer = this.useBuffer()
                const context = this
                return function () {
                    if (isFunction(callback)) {
                        buffer.backup()
                        buffer(callback.apply(context, arguments))
                        return buffer.restore()
                    }
                }
            },
        },
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
        block: {
            value(name, callback) {
                const blocks = this.getBlocks()
                blocks[name] = blocks[name] || []
                blocks[name].push(this.fn(callback))
                if (this.getExtend()) return
                const context = this
                const list = Object.assign([], blocks[name])
                const shift = function () {
                    return list.shift()
                }
                const next = function () {
                    const parent = shift()
                    if (parent) {
                        return function () {
                            context.echo(parent(next()))
                        }
                    } else {
                        return function () {}
                    }
                }
                this.echo(shift()(next()))
            },
        },
        hasBlock: {
            value(name) {
                return this.getBlocks().hasOwnProperty(name)
            },
        },
        include: {
            value(path, data, cx) {
                const context = cx === false ? {} : this.clone(true)
                const params = Object.assign(context, data || {})
                const promise = this.render(path, params)
                this.echo(promise)
            },
        },
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
        get: {
            value(name, defaults) {
                const path = getPath(this, name, true)
                const result = path.shift()
                const prop = path.pop()
                return hasProp(result, prop) ? result[prop] : defaults
            },
        },
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
        each: {
            value(object, callback) {
                if (isString(object)) {
                    object = this.get(object, [])
                }
                each(object, callback)
            },
            writable: true,
        },
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
        ui: {
            value() {},
            writable: true,
        },
        require: {
            value() {},
            writable: true,
        },
        render: {
            value() {},
            writable: true,
        },
    })
    Object.entries(methods).forEach(([name, value]) => {
        if (isFunction(value) && globals.includes(name)) {
            value = value.bind(Context.prototype)
        }
        Context.prototype[name] = value
    })
    return Context
}

export class EjsContext {
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
