import {
    extend,
    omit,
    each,
    getPath,
    hasProp,
    noop,
    safeValue
} from './utils.js'
import { isFunction, isString } from './type.js'
import { element } from './element.js'
import { createBuffer } from './buffer.js'

const PARENT = Symbol('ContextScope.parentTemplate')

const createContextScope = (config, methods) => {
    const {
        BLOCKS,
        MACRO,
        EXTEND,
        LAYOUT,
        BUFFER,
        SAFE,
        SCOPE,
        COMPONENT,
        ELEMENT
    } = config.vars

    /**
     *
     * @type {symbol}
     */

    /**
     * @name ContextScope
     * @param data
     * @constructor
     */
    function ContextScope(data) {
        this[PARENT] = null
        this[BLOCKS] = {}
        this[MACRO] = {}
        Object.assign(
            this,
            omit(data, [SCOPE, BUFFER, SAFE, COMPONENT, ELEMENT])
        )
    }

    Object.assign(ContextScope.prototype, methods)
    Object.defineProperty(ContextScope.prototype, BUFFER, {
        value: createBuffer()
    })
    Object.defineProperty(ContextScope.prototype, BLOCKS, {
        value: {},
        writable: true
    })
    Object.defineProperty(ContextScope.prototype, MACRO, {
        value: {},
        writable: true
    })
    Object.defineProperty(ContextScope.prototype, LAYOUT, {
        value: false,
        writable: true
    })
    Object.defineProperty(ContextScope.prototype, EXTEND, {
        value: false,
        writable: true
    })
    Object.defineProperty(ContextScope.prototype, PARENT, {
        value: null,
        writable: true
    })
    Object.defineProperties(ContextScope.prototype, {
        /** @type {function} */
        setParentTemplate: {
            value(value) {
                this[PARENT] = value
                return this
            }
        },
        /** @type {function} */
        getParentTemplate: {
            value() {
                return this[PARENT]
            }
        },
        /** @type {function} */
        useSafeValue: {
            get: () => safeValue
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
            }
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
            }
        },
        /** @type {()=>this[MACRO]} */
        getMacro: {
            value() {
                return this[MACRO]
            }
        },
        /** @type {function} */
        getBuffer: {
            value() {
                return this[BUFFER]
            }
        },
        /** @type {function} */
        getBlocks: {
            value() {
                return this[BLOCKS]
            }
        },
        /** @type {function} */
        setExtend: {
            value(value) {
                this[EXTEND] = value
                return this
            }
        },
        /** @type {function} */
        getExtend: {
            value() {
                return this[EXTEND]
            }
        },
        /** @type {function} */
        setLayout: {
            value(layout) {
                this[LAYOUT] = layout
                return this
            }
        },
        /** @type {function} */
        getLayout: {
            value() {
                return this[LAYOUT]
            }
        },
        /** @type {function} */
        clone: {
            value(exclude_blocks) {
                const filter = [LAYOUT, EXTEND, BUFFER]
                if (exclude_blocks === true) {
                    filter.push(BLOCKS)
                }
                return omit(this, filter)
            }
        },
        /** @type {function} */
        extend: {
            value(layout) {
                this.setExtend(true)
                this.setLayout(layout)
            }
        },
        /** @type {function} */
        echo: {
            value(layout) {
                const buffer = this.getBuffer()
                const params = [].slice.call(arguments)
                params.forEach(buffer)
            }
        },
        /** @type {function} */
        fn: {
            value(callback) {
                const buffer = this.getBuffer()
                const context = this
                return function() {
                    if (isFunction(callback)) {
                        buffer.backup()
                        buffer(callback.apply(context, arguments))
                        return buffer.restore()
                    }
                }
            }
        },
        /** @type {function} */
        macro: {
            value(name, callback) {
                const list = this.getMacro()
                const macro = this.fn(callback)
                const context = this
                list[name] = function() {
                    return context.echo(macro.apply(undefined, arguments))
                }
            }
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
            }
        },
        /** @type {function} */
        block: {
            value(name, callback) {
                const blocks = this.getBlocks()
                blocks[name] = blocks[name] || []
                blocks[name].push(this.fn(callback))
                if (this.getExtend()) return
                const list = Object.assign([], blocks[name])
                const current = () => {
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
            }
        },
        /** @type {function} */
        hasBlock: {
            value(name) {
                return this.getBlocks().hasOwnProperty(name)
            }
        },
        /** @type {function} */
        include: {
            value(path, data, cx) {
                const context = cx === false ? {} : this.clone(true)
                const params = extend(context, data || {})
                const promise = this.render(path, params)
                this.echo(promise)
            }
        },
        /** @type {function} */
        use: {
            value(path, namespace) {
                this.echo(
                    Promise.resolve(this.require(path)).then((exports) => {
                        const list = this.getMacro()
                        each(exports, function(macro, name) {
                            list[[namespace, name].join('.')] = macro
                        })
                    })
                )
            }
        },
        /** @type {function} */
        async: {
            value(promise, callback) {
                this.echo(Promise.resolve(promise).then(callback))
            }
        },
        /** @type {function} */
        get: {
            value(name, defaults) {
                const path = getPath(this, name, true)
                const result = path.shift()
                const prop = path.pop()
                return hasProp(result, prop) ? result[prop] : defaults
            }
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
            }
        },
        /** @type {function} */
        each: {
            value: function(object, callback) {
                if (isString(object)) {
                    object = this.get(object, [])
                }
                each(object, callback)
            },
            writable: true
        },
        /** @type {function} */
        el: {
            value(tag, attr, content) {
                content = isFunction(content) ? this.fn(content)() : content
                this.echo(
                    Promise.resolve(content).then((content) =>
                        element(tag, attr, content)
                    )
                )
            },
            writable: true
        },
        /** @type {function} */
        ui: {
            value(layout) {
            },
            writable: true
        }
    })
    return ContextScope
}

export const Context = (options, methods) => {
    /**
     * @type {InstanceType<ContextScope>}
     */
    let Scope
    const create = (data) => {
        return new Scope(data)
    }
    const helpers = (methods) => {
        extend(Scope.prototype, methods || {})
    }
    const configure = (options, methods) => {
        Scope = createContextScope(options, methods)
    }
    configure(options, methods)
    return {
        configure,
        create,
        helpers
    }
}

