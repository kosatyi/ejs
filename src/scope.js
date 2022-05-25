const { extend, omit, each, getPath, hasProp, noop } = require('./utils')
const element = require('./element')

/**
 *
 * @param instance
 * @method create
 * @constructor
 */
function Component(instance) {
    this.props = extend({}, instance.props)
    this.create = instance.create.bind(this)
}

/**
 *
 */
Component.prototype = {
    element,
    render(props) {
        return this.create(extend({}, this.props, props))
    },
}

/**
 *
 * @return {buffer}
 * @constructor
 */
function StringBuffer() {
    let store,
        array = []
    function buffer(value) {
        array.push(value)
    }
    buffer.start = function () {
        array = []
    }
    buffer.backup = function () {
        store = array.concat()
        array = []
    }
    buffer.restore = function () {
        const result = array.concat()
        array = store.concat()
        return result.join('')
    }
    buffer.end = function () {
        return array.join('')
    }
    return buffer
}

function configure(vars) {
    const { EXTEND, MACROS, LAYOUT, PRINT, BLOCKS, BUFFER } = vars
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
            this[BUFFER] = StringBuffer()
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
         * @memberOf window
         * @type Function
         */
        echo() {
            const buffer = this.getBuffer()
            buffer([].join.call(arguments, ''))
        },
        /**
         * Buffered output callback
         * @memberOf window
         * @type Function
         * @param {Function} callback
         * @return {Function}
         */
        macro(callback) {
            const buffer = this.getBuffer()
            return function () {
                buffer.backup()
                callback && callback.apply(this, arguments)
                return buffer.restore()
            }.bind(this)
        },
        /**
         * @memberOf window
         */
        element(tag, attr, content) {
            this.echo(element(tag, attr, this.macro(content)()))
        },
        /**
         * @memberOf window
         * @param {Object} instance
         */
        component(instance) {
            instance = new Component(instance)
            return function component(props) {
                this.echo(instance.render(props))
            }.bind(this)
        },
        /**
         * @memberOf window
         * @param name
         * @param defaults
         */
        get(name, defaults) {
            const [result, prop] = getPath(this, name)
            return hasProp(result, prop) ? result[prop] : defaults
        },
        /**
         * @memberOf window
         * @param name
         * @param value
         */
        set(name, value) {
            const [result, prop] = getPath(this, name)
            result[prop] = value
        },
        /**
         * @memberOf window
         * @param name
         */
        call(name) {
            const params = [].slice.call(arguments, 1)
            const [result, prop] = getPath(this, name)
            if (typeof result[prop] === 'function') {
                return result[prop].apply(result, params)
            }
        },
        /**
         * @memberOf window
         * @param object
         * @param callback
         */
        each(object, callback) {
            if (typeof object === 'string') {
                object = this.get(object, [])
            }
            each(object, callback, this)
        },
        /**
         * @memberOf window
         * @param {String} layout
         */
        extend(layout) {
            this.setExtend(true)
            this.setLayout(layout)
        },
        /**
         * @memberOf window
         * @param name
         * @param callback
         * @return {*}
         */
        block(name, callback) {
            const blocks = this.getBlocks()
            if (this.getExtend()) {
                blocks[name] = this.macro(callback)
            } else {
                if (blocks[name]) {
                    this.echo(blocks[name](this.macro(callback)))
                } else {
                    this.echo(this.macro(callback)(noop))
                }
            }
        },
    }
    return Scope
}

module.exports = configure
