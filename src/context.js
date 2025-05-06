import {
    extend,
    omit,
    each,
    getPath,
    hasProp,
    noop,
    bindContext,
} from './utils.js'
import { isFunction, isString } from './type.js'
import { element } from './element.js'
import { createBuffer } from './buffer.js'

const createScope = (config, methods) => {
    const { BLOCKS, MACRO, EXTEND, LAYOUT, BUFFER, COMPONENT, SAFE, SCOPE } =
        config.vars
    /**
     * @name ContextScope
     * @param data
     * @constructor
     */
    function ContextScope(data) {
        this[BLOCKS] = {}
        this[MACRO] = {}
        Object.assign(this, omit(data, [SCOPE, BUFFER, SAFE, COMPONENT]))
    }

    Object.assign(ContextScope.prototype, methods)
    Object.defineProperties(ContextScope.prototype, {
        [BUFFER]: {
            value: createBuffer(),
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
        /** @type {()=>this[MACRO]} */
        getMacro: {
            value() {
                return this[MACRO]
            },
        },
        /** @type {function} */
        getBuffer: {
            value() {
                return this[BUFFER]
            },
        },
        /** @type {function} */
        getComponent: {
            value() {
                const context = this
                if (COMPONENT in context) {
                    return function () {
                        return context[COMPONENT].apply(context, arguments)
                    }
                }
                return function () {
                    console.log('%s function not defined', COMPONENT)
                }
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
            value(layout) {
                const buffer = this.getBuffer()
                const params = [].slice.call(arguments)
                params.forEach(buffer)
            },
        },
        /** @type {function} */
        fn: {
            value(callback) {
                const buffer = this.getBuffer()
                const context = this
                return function () {
                    buffer.backup()
                    if (isFunction(callback)) {
                        callback.apply(context, arguments)
                    }
                    return buffer.restore()
                }
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
                if (this.getExtend() && hasProp(result, prop)) {
                    return result[prop]
                }
                return (result[prop] = value)
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
                const current = function () {
                    return list.shift()
                }
                const next = () => {
                    const parent = current()
                    if (parent) {
                        return () => {
                            this.echo(parent(next()))
                        }
                    } else {
                        return noop
                    }
                }
                this.echo(current()(next()))
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
                const params = extend(context, data || {})
                const promise = this.render(path, params)
                this.echo(promise)
            },
        },
        /** @type {function} */
        promiseResolve: {
            value(value, callback) {
                return Promise.resolve(
                    isFunction(value) ? this.fn(value)() : value
                ).then(callback.bind(this))
            },
        },
        /** @type {function} */
        use: {
            value(path, namespace) {
                this.echo(
                    this.promiseResolve(this.require(path), function (exports) {
                        const list = this.getMacro()
                        each(exports, function (macro, name) {
                            list[[namespace, name].join('.')] = macro
                        })
                    })
                )
            },
        },
        /** @type {function} */
        async: {
            value(promise, callback) {
                this.echo(
                    this.promiseResolve(promise, function (data) {
                        return this.fn(callback)(data)
                    })
                )
            },
        },
        /** @type {function} */
        each: {
            value: function (object, callback) {
                if (isString(object)) {
                    object = this.get(object, [])
                }
                each(object, callback)
            },
        },
        /** @type {function} */
        element: {
            value(tag, attr, content) {
                return element(tag, attr, content)
            },
        },
        /** @type {function} */
        el: {
            value(tag, attr, content) {
                this.echo(
                    this.promiseResolve(content, function (content) {
                        return this.element(tag, attr, content)
                    })
                )
            },
        },
    })
    return ContextScope
}

export class Context {
    #scope

    constructor(config, methods) {
        bindContext(this, ['create', 'helpers', 'configure'])
        this.configure(config, methods)
    }

    create(data) {
        return new this.#scope(data)
    }

    configure(config, methods) {
        this.#scope = createScope(config, methods)
    }

    helpers(methods) {
        extend(this.#scope.prototype, methods || {})
    }
}
