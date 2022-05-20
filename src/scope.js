const { extend, omit, each, getPath, hasProp, noop } = require('./utils')

function configure(vars) {
    const { EXTEND, MACROS, LAYOUT, OUTPUT, PRINT, BLOCKS } = vars
    function Scope(data = {}) {
        this.setBlocks()
        extend(this, data)
        this.setLayout(false)
        this.setExtend(false)
    }
    Scope.helpers = function (methods) {
        extend(Scope.prototype, methods)
    }
    Scope.prototype = {
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
            const filter = [LAYOUT, OUTPUT, EXTEND, MACROS, PRINT]
            if (exclude_blocks === true) {
                filter.push(BLOCKS)
            }
            return omit(this, filter)
        },
        /**
         * Join values to output buffer
         * @memberOf window
         * @type Function
         * @param args
         */
        print(...args) {
            this[PRINT](...args)
        },
        /**
         * Buffered output callback
         * @memberOf window
         * @type Function
         * @param {Function} callback
         * @return {Function}
         */
        macro(callback) {
            return this[MACROS](callback)
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
         * @param args
         */
        call(name, ...args) {
            const [result, prop] = getPath(this, name)
            if (typeof result[prop] === 'function') {
                return result[prop](...args)
            }
        },
        /**
         * @memberOf window
         * @param object
         * @param callback
         */
        each(object, callback) {
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
                    this.print(blocks[name](this.macro(callback)))
                } else {
                    this.print(this.macro(callback)(noop))
                }
            }
        },
    }
    return Scope
}

module.exports = configure
