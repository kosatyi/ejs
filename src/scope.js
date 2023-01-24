import { extend, omit, each, getPath, hasProp, noop, resolve, defineProp } from './utils'
import { isFunction, isString } from './type'

import element from './element'
import Buffer from './buffer'

const configure = (config, methods) => {
    /**
     *
     */
    const { EXTEND, LAYOUT, BLOCKS, BUFFER, MACRO, SCOPE } = config.vars
    /**
     * @memberOf global
     * @name [SCOPE]
     * @param data
     * @constructor
     */
    function Scope(data = {}) {
        this.initBlocks()
        this.initMacro()
        extend(this, data)
    }
    /**
     * @static
     * @param methods
     */
    Scope.helpers = (methods) => {
        extend(Scope.prototype, methods)
    }
    /**
     * @static
     * @param name
     * @param descriptor
     */
    Scope.property = (name, descriptor) => {
        Object.defineProperty(Scope.prototype, name, descriptor)
    }
    /**
     * @static
     * @param name
     * @param method
     */
    Scope.method = (name, method) => {
        return Scope.property(name,{
            value: method,
            writable: false,
            configurable: false,
            enumerable: false
        })
    }
    /**
     *
     */
    Scope.property(BUFFER, {
        value: Buffer(),
        writable: false,
        configurable: false,
        enumerable: false
    })
    /**
     *
     */
    Scope.property(BLOCKS, {
        value: {},
        writable: true,
        configurable: false,
        enumerable: false
    })
    /**
     *
     */
    Scope.property(MACRO, {
        value: {},
        writable: true,
        configurable: false,
        enumerable: false
    })
    /**
     *
     */
    Scope.property(LAYOUT, {
        value: false,
        writable: true,
        configurable: false,
        enumerable: false
    })
    /**
     *
     */
    Scope.property(EXTEND, {
        value: false,
        writable: true,
        configurable: false,
        enumerable: false
    })
    /**
     *
     */
    Scope.method('initBlocks', function() {
        this[BLOCKS] = {}
    })
    /**
     *
     */
    Scope.method('initMacro', function() {
        this[MACRO] = {}
    })
    /**
     *
     */
    Scope.method('getMacro', function() {
        return this[MACRO]
    })
    /**
     *
     */
    Scope.method('getBuffer', function() {
        return this[BUFFER]
    })
    /**
     *
     */
    Scope.method('getBlocks', function() {
        return this[BLOCKS]
    })
    /**
     *
     */
    Scope.method('setExtend', function(value) {
        this[EXTEND] = value
    })
    /**
     *
     */
    Scope.method('getExtend', function() {
        return this[EXTEND]
    })
    /**
     *
     */
    Scope.method('setLayout', function(layout) {
        this[LAYOUT] = layout
    })
    /**
     *
     */
    Scope.method('getLayout', function() {
        return this[LAYOUT]
    })
    /**
     *
     */
    Scope.method('clone', function(exclude_blocks) {
        const filter = [LAYOUT, EXTEND, BUFFER]
        if (exclude_blocks === true) {
            filter.push(BLOCKS)
        }
        return omit(this, filter)
    })
    /**
     * @methodOf global
     * @function extend
     * @param layout
     */
    Scope.method('extend', function(layout) {
        this.setExtend(true)
        this.setLayout(layout)
    })
    /**
     * @memberOf global
     * @function echo
     */
    Scope.method('echo', function() {
        const buffer = this.getBuffer()
        const params = [].slice.call(arguments)
        params.forEach(function(item) {
            buffer(item)
        })
    })
    /**
     * @memberOf global
     * @function fn
     * @param callback
     */
    Scope.method('fn', function(callback) {
        const buffer = this.getBuffer()
        const context = this
        return function() {
            buffer.backup()
            if (isFunction(callback)) {
                callback.apply(context, arguments)
            }
            return buffer.restore()
        }
    })
    /**
     * @memberOf global
     * @function get
     * @param name
     * @param [defaults]
     */
    Scope.method('get', function(name,defaults) {
        const path = getPath(this, name)
        const result = path.shift()
        const prop = path.pop()
        return hasProp(result, prop) ? result[prop] : defaults
    })
    /**
     * @memberOf global
     * @function set
     * @param name
     * @param value
     */
    Scope.method('set', function(name,value) {
        const path = getPath(this, name)
        const result = path.shift()
        const prop = path.pop()
        if (this.getExtend() && hasProp(result, prop)) {
            return result[prop]
        }
        return result[prop] = value
    })
    /**
     * @memberOf global
     * @function macro
     * @param name
     * @param callback
     */
    Scope.method('macro', function(name, callback) {
        const list = this.getMacro()
        const macro = this.fn(callback)
        const context = this
        list[name] = function() {
            return context.echo(macro.apply(undefined, arguments))
        }
    })
    /**
     * @memberOf global
     * @function call
     * @param name
     * @param {...*} args
     */
    Scope.method('call', function(name) {
        const list = this.getMacro()
        const macro = list[name]
        const params = [].slice.call(arguments, 1)
        if (isFunction(macro)) {
            return macro.apply(macro, params)
        }
    })
    /**
     * @memberOf global
     * @function block
     * @param name
     * @param callback
     */
    Scope.method('block',function(name,callback){
        const blocks = this.getBlocks()
        blocks[name] = blocks[name] || []
        blocks[name].push(this.fn(callback))
        if (this.getExtend()) return
        const list = Object.assign([], blocks[name])
        const current = function() {
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
    })
    /**
     *  @memberOf global
     *  @function include
     *  @param path
     *  @param [data]
     *  @param [cx]
     */
    Scope.method('include',function(path, data, cx){
        const context = cx === false ? {} : this.clone(true)
        const params = extend(context, data || {})
        const promise = this.render(path, params)
        this.echo(promise)
    })
    /**
     * @memberOf global
     * @function use
     * @param path
     * @param namespace
     */
    Scope.method('use',function(path, namespace){
        const promise = this.require(path)
        this.echo(resolve(promise,function(exports){
            const list = this.getMacro()
            each(exports, function(macro, name) {
                list[[namespace, name].join('.')] = macro
            })
        },this))
    })
    /**
     *  @memberOf global
     *  @function async
     *  @param promise
     *  @param callback
     */
    Scope.method('async',function(promise,callback){
        this.echo(
            resolve(promise, function(data) {
                return this.fn(callback)(data)
            }, this)
        )
    })
    Scope.helpers(methods)
    Scope.helpers({
        /**
         * @memberOf global
         * @param tag
         * @param attr
         * @param content
         */
        el(tag, attr, content) {
            if (isFunction(content)) {
                content = this.fn(content)()
            }
            this.echo(
                resolve(content, function(content) {
                    return element(tag, attr, content)
                }, this)
            )
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
            each(object, callback)
        }
    })
    return Scope
}

export default configure
