import { extend, getPath, hasProp } from './utils'

const LAYOUT = '$$l'
const BLOCKS = '$$b'
const EXTEND = '$$_'
const MACRO = '$$m'
const PRINT = '$$j'

const noop = () => {}

/**
 * @with helper
 * @type {{}}
 */
function Scope(data) {
    this[BLOCKS] = {}
    this[LAYOUT] = null
    data = data || {}
    if (data instanceof Scope) {
        data[LAYOUT] = null
    }
    extend(this, data)
}

Scope.prototype = {
    LAYOUT,
    BLOCKS,
    EXTEND,
    MACRO,
    PRINT,
    /**
     * Inline macros
     * @memberOf window
     * @type Function
     * @param {Function} callback
     * @return {Function}
     */
    $$m(callback) {},
    /**
     * Join arguments to output buffer
     * @memberOf window
     * @type Function
     * @param args
     */
    $$j(...args) {},
    /**
     * Print arguments to output buffer
     * @memberOf window
     * @param args
     * @return {Function}
     */
    print(...args) {
        this.$$j(...args)
    },
    /**
     * @memberOf window
     * @param {Function} callback
     * @return {Function}
     */
    macro(callback) {
        return this.$$m(callback)
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
     * @param object
     * @param callback
     */
    each(object, callback) {
        let prop
        for (prop in object) {
            if (object.hasOwnProperty(prop)) {
                callback.call(this, object[prop], prop, object)
            }
        }
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
    getLayout() {
        return this[LAYOUT]
    },
    extend(layout) {
        this[LAYOUT] = layout
    },
    setBlock(name, callback) {
        const blocks = this[BLOCKS]
        blocks[name] = this.$$m(callback)
    },
    callBlock(name, callback) {
        const blocks = this[BLOCKS]
        if (blocks[name]) {
            this.$$j(blocks[name](this.$$m(callback)))
        } else if (callback) {
            this.$$j(this.$$m(callback)(noop))
        }
    },
    /**
     * @memberOf window
     * @param name
     * @param callback
     * @return {*}
     */
    block(name, callback) {
        if (this.getLayout()) {
            this.setBlock(name, callback)
        } else {
            this.callBlock(name, callback)
        }
    },
}

const helpers = (methods) => {
    extend(Scope.prototype, methods)
}

export { Scope, helpers }
