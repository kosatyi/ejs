const { extend, omit, each, getPath, hasProp, noop } = require('./utils')
const { isFunction, isString } = require('./type')
const element = require('./element')
const Buffer = require('./buffer')
const Component = require('./component')

function configure(config) {
    const { EXTEND, MACROS, LAYOUT, PRINT, BLOCKS, BUFFER } = config.vars
    function Scope(data = {}) {
        this.setBlocks()
        extend(this, data)
        this.setBuffer()
        this.setLayout(false)
        this.setExtend(false)
    }
    Scope.helpers = function (methods) {
        extend(Scope.prototype, methods)
    }
    Scope.prototype = {
        getBuffer() {
            return this[BUFFER]
        },
        setBuffer() {
            this[BUFFER] = Buffer()
        },
        setExtend(state) {
            this[EXTEND] = state
        },
        getExtend() {
            return this[EXTEND]
        },
        getLayout() {
            return this[LAYOUT]
        },
        setLayout(layout) {
            this[LAYOUT] = layout
        },
        setBlocks() {
            this[BLOCKS] = {}
        },
        getBlocks() {
            return this[BLOCKS]
        },
        clone(exclude_blocks) {
            const filter = [LAYOUT, EXTEND, MACROS, PRINT, BUFFER]
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
            params.forEach(function (item) {
                buffer(item)
            })
        },
        /**
         * Buffered output callback
         * @memberOf global
         * @type Function
         * @param {Function} callback
         * @param {Boolean} [echo]
         * @return {Function}
         */
        macro(callback, echo) {
            const buffer = this.getBuffer()
            const macro = function () {
                buffer.backup()
                if (isFunction(callback)) {
                    callback.apply(this, arguments)
                }
                const result = buffer.restore()
                return echo === true ? this.echo(result) : result
            }.bind(this)
            macro.ctx = this
            return macro
        },
        /**
         *
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
                this.resolve(promise, function (data) {
                    return this.macro(callback)(data)
                })
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
                this.resolve(content, function (content) {
                    return element(tag, attr, content)
                })
            )
        },
        /**
         * @memberOf global
         * @param {Object} instance
         */
        component(instance) {
            instance = new Component(instance)
            return function component(props) {
                this.echo(instance.render(props))
            }.bind(this)
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
            const macro = this.macro(callback)
            if (this.getExtend()) {
                blocks[name] = macro
            } else {
                const block = blocks[name]
                const parent = function () {
                    this.echo(macro())
                }.bind(block ? block.ctx : null)
                if (block) {
                    this.echo(block(parent))
                } else {
                    this.echo(macro(noop))
                }
            }
        },
        /**
         * @memberOf global
         * @param {string} path
         * @param {object} [data]
         * @param {boolean} [cx]
         * @return {string|{}}
         */
        include(path, data = {}, cx = true) {
            const params = extend(cx ? this.clone(true) : {}, data)
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
                    promise.then(function (exports) {
                        scope.set(namespace, exports)
                    })
                    return this
                },
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
                    promise.then(function (exports) {
                        params.forEach(function (name) {
                            scope.set(name, exports[name])
                        })
                    })
                    return this
                },
            }
        },
    }
    return Scope
}

module.exports = configure
