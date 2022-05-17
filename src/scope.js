import { extend, getPath, hasProp } from './utils'
import { Output } from './output'

import { EXTEND, OUTPUT, LAYOUT, BLOCKS } from './defaults'

const noop = () => {}

/**
 * @with helper
 * @type {{}}
 */
function Scope(data = {}) {
    this[BLOCKS] = {}
    extend(this, data)
    this[OUTPUT] = Output()
    this[EXTEND] = false
}

Scope.prototype = {
    clone() {
        this[EXTEND] = false
        return this
    },
    /**
     * Buffered output callback
     * @memberOf window
     * @type Function
     * @param {Function} callback
     * @return {Function}
     */
    $$m(callback) {
        return (...args) => {
            this[OUTPUT].backup()
            callback(...args)
            return this[OUTPUT].restore()
        }
    },
    /**
     * Join values to output buffer
     * @memberOf window
     * @type Function
     * @param args
     */
    $$j(...args) {
        this[OUTPUT](args.join(''))
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
    getOutput() {
        return this[OUTPUT]
    },
    /**
     *
     * @return {Scope[EXTEND]|boolean}
     */
    hasExtend() {
        return this[EXTEND] === true
    },
    /**
     *
     * @return {Scope[LAYOUT]}
     */
    getLayout() {
        return this[LAYOUT]
    },
    /**
     *
     * @return {Scope[BLOCKS]|{}}
     */
    getBlocks() {
        return this[BLOCKS]
    },
    /**
     * @memberOf window
     * @param {String} layout
     */
    extend(layout) {
        this[EXTEND] = true
        this[LAYOUT] = layout
    },
    /**
     * @memberOf window
     * @param name
     * @param callback
     * @return {*}
     */
    block(name, callback) {
        const blocks = this.getBlocks()
        if (this.hasExtend()) {
            blocks[name] = this.$$m(callback)
        } else {
            if (blocks[name]) {
                this.$$j(blocks[name](this.$$m(callback)))
            } else if (callback) {
                this.$$j(this.$$m(callback)(noop))
            }
        }
    },
}

const helpers = (methods) => {
    extend(Scope.prototype, methods)
}

export { Scope, helpers }
