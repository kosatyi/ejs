import { extend, omit, each, getPath, hasProp, noop, resolve } from './utils'
import { isFunction, isString } from './type'

import { element } from './element'
import createBuffer from './buffer'

export class Context {
    constructor(config) {
        this.configure(config)
    }
    configure(config) {
        const { EXTEND, LAYOUT, BLOCKS, BUFFER, MACRO } = config.vars

        this.create = (data) => {
            return new Scope(data)
        }

        this.helpers = (methods) => {
            extend(Scope.prototype, methods)
        }

        function Scope(data = {}) {
            this.initBlocks()
            this.initMacro()
            extend(this, data)
        }

        Scope.helpers = (methods) => {
            extend(Scope.prototype, methods)
        }
        Scope.defineProp = Scope.method = (
            name,
            value,
            writable = false,
            configurable = false,
            enumerable = false
        ) => {
            Object.defineProperty(Scope.prototype, name, {
                value,
                writable,
                configurable,
                enumerable,
            })
        }

        Scope.defineProp(BUFFER, createBuffer())

        Scope.defineProp(BLOCKS, {}, true)

        Scope.defineProp(MACRO, {}, true)

        Scope.defineProp(LAYOUT, false, true)

        Scope.defineProp(EXTEND, false, true)

        Scope.method('initBlocks', function () {
            this[BLOCKS] = {}
        })

        Scope.method('initMacro', function () {
            this[MACRO] = {}
        })

        Scope.method('getMacro', function () {
            return this[MACRO]
        })

        Scope.method('getBuffer', function () {
            return this[BUFFER]
        })

        Scope.method('getBlocks', function () {
            return this[BLOCKS]
        })

        Scope.method('setExtend', function (value) {
            this[EXTEND] = value
        })

        Scope.method('getExtend', function () {
            return this[EXTEND]
        })

        Scope.method('setLayout', function (layout) {
            this[LAYOUT] = layout
        })

        Scope.method('getLayout', function () {
            return this[LAYOUT]
        })

        Scope.method('clone', function (exclude_blocks) {
            const filter = [LAYOUT, EXTEND, BUFFER]
            if (exclude_blocks === true) {
                filter.push(BLOCKS)
            }
            return omit(this, filter)
        })

        Scope.method('extend', function (layout) {
            this.setExtend(true)
            this.setLayout(layout)
        })

        Scope.method('echo', function () {
            const buffer = this.getBuffer()
            const params = [].slice.call(arguments)
            params.forEach(buffer)
        })

        Scope.method('fn', function (callback) {
            const buffer = this.getBuffer()
            const context = this
            return function () {
                buffer.backup()
                if (isFunction(callback)) {
                    callback.apply(context, arguments)
                }
                return buffer.restore()
            }
        })
        Scope.method('get', function (name, defaults) {
            const path = getPath(this, name)
            const result = path.shift()
            const prop = path.pop()
            return hasProp(result, prop) ? result[prop] : defaults
        })

        Scope.method('set', function (name, value) {
            const path = getPath(this, name)
            const result = path.shift()
            const prop = path.pop()
            if (this.getExtend() && hasProp(result, prop)) {
                return result[prop]
            }
            return (result[prop] = value)
        })

        Scope.method('macro', function (name, callback) {
            const list = this.getMacro()
            const macro = this.fn(callback)
            const context = this
            list[name] = function () {
                return context.echo(macro.apply(undefined, arguments))
            }
        })

        Scope.method('call', function (name) {
            const list = this.getMacro()
            const macro = list[name]
            const params = [].slice.call(arguments, 1)
            if (isFunction(macro)) {
                return macro.apply(macro, params)
            }
        })

        Scope.method('block', function (name, callback) {
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
        })

        Scope.method('include', function (path, data, cx) {
            const context = cx === false ? {} : this.clone(true)
            const params = extend(context, data || {})
            const promise = this.render(path, params)
            this.echo(promise)
        })

        Scope.method('use', function (path, namespace) {
            const promise = this.require(path)
            this.echo(
                resolve(
                    promise,
                    function (exports) {
                        const list = this.getMacro()
                        each(exports, function (macro, name) {
                            list[[namespace, name].join('.')] = macro
                        })
                    },
                    this
                )
            )
        })

        Scope.method('async', function (promise, callback) {
            this.echo(
                resolve(
                    promise,
                    function (data) {
                        return this.fn(callback)(data)
                    },
                    this
                )
            )
        })

        Scope.method('el', function (tag, attr, content) {
            if (isFunction(content)) {
                content = this.fn(content)()
            }
            this.echo(
                resolve(
                    content,
                    function (content) {
                        return element(tag, attr, content)
                    },
                    this
                )
            )
        })

        Scope.method('each', function (object, callback) {
            if (isString(object)) {
                object = this.get(object, [])
            }
            each(object, callback)
        })
    }
}
