import { extend, omit, map, each, getPath, hasProp, noop, isPromise } from './utils'
import { isFunction, isString } from './type'

import element from './element'
import Buffer from './buffer'
import Component from './component'

const Scope = (config, methods) => {
    /**
     *
     */
    const { EXTEND, MACROS, LAYOUT, BLOCKS, BUFFER } = config.vars

    /**
     *
     * @param data
     * @constructor
     */
    function Scope(data = {}) {
        this.setBlocks({})
        extend(this, data)
        this.setLayout(false)
        this.setExtend(false)
    }

    /**
     *
     */
    Object.defineProperties(Scope.prototype, {
        [BUFFER]: {
            value: Buffer(),
            writable: false,
            configurable: false,
            enumerable: false
        },
        // [BLOCKS]: {
        //     value: {},
        //     writable: true,
        //     configurable: false,
        //     enumerable: false
        // },
        // [EXTEND]: {
        //     value: false,
        //     writable: true,
        //     configurable: false,
        //     enumerable: false
        // },
        // [LAYOUT]: {
        //     value: false,
        //     writable: true,
        //     configurable: false,
        //     enumerable: false
        // },
        // setBuffer: {
        //     value(value) {
        //         this[BUFFER] = value
        //     },
        //     writable: false,
        //     configurable: false
        // },
        getBuffer: {
            value() {
                return this[BUFFER]
            },
            writable: false,
            configurable: false
        },
        setBlocks: {
            value(value) {
                this[BLOCKS] = value
            },
            writable: false,
            configurable: false
        },
        getBlocks: {
            value() {
                return this[BLOCKS]
            },
            writable: false,
            configurable: false
        },
        setExtend: {
            value(value) {
                this[EXTEND] = value
            },
            writable: false,
            configurable: false
        },
        getExtend: {
            value() {
                return this[EXTEND]
            },
            writable: false,
            configurable: false
        },
        setLayout: {
            value(layout) {
                this[LAYOUT] = layout
            },
            writable: false,
            configurable: false
        },
        getLayout: {
            value() {
                return this[LAYOUT]
            },
            writable: false,
            configurable: false
        }
    })

    Scope.helpers = (methods) => {
        extend(Scope.prototype, methods)
    }

    /**
     * @lends Scope.prototype
     */
    Scope.helpers(methods)
    /**
     * @lends Scope.prototype
     */
    Scope.helpers({
        /**
         * @return {*}
         */
        clone(exclude_blocks) {
            const filter = [LAYOUT, EXTEND, MACROS, BUFFER]
            if (exclude_blocks === true) {
                filter.push(BLOCKS)
            }
            return omit(this, filter)
        },
        /**
         * Join values to output buffer
         * @memberOf global
         * @type Function
         */
        echo() {
            const buffer = this.getBuffer()
            const params = [].slice.call(arguments)
            params.forEach(function(item) {
                buffer(item)
            })
        },
        /**
         * Buffered output callback
         * @type Function
         * @param {Function} callback
         * @param {Boolean} [echo]
         * @return {Function}
         */
        macro(callback, echo) {
            const buffer = this.getBuffer()
            const macro = function() {
                buffer.backup()
                if (isFunction(callback)) {
                    callback.apply(this, arguments)
                }
                const result = buffer.restore()
                return echo === true ? this.echo(result) : result
            }.bind(this)
            macro.__context = this
            macro.__source = callback
            macro.__layout = this.getLayout()
            return macro
        },
        /**
         * @memberOf global
         * @param value
         * @param callback
         * @return {Promise<unknown>}
         */
        resolve(value, callback) {
            return Promise.resolve(value).then(callback.bind(this))
        },
        /**
         * @memberOf global
         */
        async(promise, callback) {
            this.echo(
                this.resolve(promise, (data) => this.macro(callback)(data))
            )
        },
        /**
         * @memberOf global
         */
        node: element,
        /**
         * @memberOf global
         */
        element(tag, attr, content) {
            if (isFunction(content)) {
                content = this.macro(content)()
            }
            this.echo(
                this.resolve(content, (content) => element(tag, attr, content))
            )
        },
        /**
         * @memberOf global
         * @param {String} namespace
         * @param {Object} instance
         */
        component(namespace, instance) {
            instance = Component(instance)
            this.set(
                namespace,
                function(props) {
                    this.echo(instance.render(props))
                }.bind(this)
            )
        },
        /**
         * @memberOf global
         * @param name
         * @param defaults
         */
        get(name, defaults) {
            const path = getPath(this, name)
            const result = path.shift()
            const prop = path.pop()
            return hasProp(result, prop) ? result[prop] : defaults
        },
        /**
         * @memberOf global
         * @param {String} name
         * @param value
         * @return
         */
        set(name, value) {
            const path = getPath(this, name)
            const result = path.shift()
            const prop = path.pop()
            if (this.getExtend()) {
                if (hasProp(result, prop)) {
                    return result[prop]
                }
            }
            result[prop] = value
        },
        /**
         * @memberOf global
         * @param name
         */
        call(name) {
            const params = [].slice.call(arguments, 1)
            const path = getPath(this, name)
            const result = path.shift()
            const prop = path.pop()
            if (isFunction(result[prop])) {
                return result[prop].apply(result, params)
            }
        },
        /**
         * @memberOf global
         * @param object
         * @param callback
         */
        each(object, callback) {
            if (isString(object)) {
                object = this.get(object, [])
            }
            each(object, callback, this)
        },
        /**
         * @memberOf global
         * @param {String} layout
         */
        extend(layout) {
            this.setExtend(true)
            this.setLayout(layout)
        },
        /**
         * @memberOf global
         * @param name
         * @param callback
         * @return {*}
         */
        block(name, callback) {
            const blocks = this.getBlocks()
            blocks[name] = blocks[name] || []
            blocks[name].push(this.macro(callback))
            if (this.getExtend()) return
            const current = function(){
                return blocks[name].shift()
            }
            const next = function() {
                const parent = current()
                if (parent) {
                    const context = parent.__context
                    return function() {
                        context.echo(parent(next()))
                    }
                } else {
                    return function() {
                    }
                }
            }
            this.echo(current()(next()))
        },
        /**
         * @memberOf global
         * @param {string} path
         * @param {object} [data]
         * @param {boolean} [cx]
         */
        include(path, data, cx) {
            const context = cx === false ? {} : this.clone(true)
            const params = extend(context, data || {})
            const promise = this.render(path, params)
            this.echo(promise)
        },
        /**
         * @memberOf global
         * @param {string} path
         */
        use(path) {
            const scope = this
            const promise = this.require(path)
            this.echo(promise)
            return {
                as(namespace) {
                    promise.then((exports) => {
                        scope.set(namespace, exports)
                    })
                    return this
                }
            }
        },
        /**
         * @memberOf global
         * @param {string} path
         */
        from(path) {
            const scope = this
            const promise = this.require(path)
            this.echo(promise)
            return {
                use() {
                    const params = [].slice.call(arguments)
                    promise.then((exports) => {
                        params.forEach((name) => {
                            scope.set(name, exports[name])
                        })
                    })
                    return this
                }
            }
        }
    })
    return Scope
}

export default Scope
