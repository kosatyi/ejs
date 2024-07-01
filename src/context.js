import {
    extend,
    omit,
    each,
    getPath,
    hasProp,
    noop,
    resolve,
    instanceOf,
} from './utils.js'
import { isFunction, isString } from './type.js'

import { element } from './element.js'

import { createBuffer } from './buffer.js'

export function Context(config) {
    if (instanceOf(this, Context) === false) return new Context(config)
    this.configure = function (config, methods) {
        const { BLOCKS, MACRO, EXTEND, LAYOUT, BUFFER, COMPONENT } = config.vars

        this.create = function (data) {
            return new Scope(data)
        }

        this.helpers = function (methods) {
            extend(Scope.prototype, methods || {})
        }

        function Scope(data) {
            this[BLOCKS] = {}
            this[MACRO] = {}
            extend(this, data || {})
        }

        Scope.prototype = extend({}, methods || {})
        Object.defineProperties(Scope.prototype, {
            [BUFFER]: {
                value: createBuffer(),
                writable: true,
                configurable: false,
                enumerable: false,
            },
            [BLOCKS]: {
                value: {},
                writable: true,
                configurable: false,
                enumerable: false,
            },
            [MACRO]: {
                value: {},
                writable: true,
                configurable: false,
                enumerable: false,
            },
            [LAYOUT]: {
                value: false,
                writable: true,
                configurable: false,
                enumerable: false,
            },
            [EXTEND]: {
                value: false,
                writable: true,
                configurable: false,
                enumerable: false,
            },
            getMacro: {
                value() {
                    return this[MACRO]
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            getBuffer: {
                value() {
                    return this[BUFFER]
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            getComponent: {
                value() {
                    const context = this
                    if (hasProp(context, COMPONENT)) {
                        return function () {
                            return context[COMPONENT].apply(context, arguments)
                        }
                    }
                    return function () {
                        console.log('%s function not defined', COMPONENT)
                    }
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            getBlocks: {
                value() {
                    return this[BLOCKS]
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            setExtend: {
                value(value) {
                    this[EXTEND] = value
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            getExtend: {
                value() {
                    return this[EXTEND]
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            setLayout: {
                value(layout) {
                    this[LAYOUT] = layout
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            getLayout: {
                value() {
                    return this[LAYOUT]
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            clone: {
                value(exclude_blocks) {
                    const filter = [LAYOUT, EXTEND, BUFFER]
                    if (exclude_blocks === true) {
                        filter.push(BLOCKS)
                    }
                    return omit(this, filter)
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            extend: {
                value(layout) {
                    this.setExtend(true)
                    this.setLayout(layout)
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            echo: {
                value(layout) {
                    const buffer = this.getBuffer()
                    const params = [].slice.call(arguments)
                    params.forEach(buffer)
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
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
                writable: false,
                configurable: false,
                enumerable: false,
            },
            get: {
                value(name, defaults) {
                    const path = getPath(this, name, true)
                    const result = path.shift()
                    const prop = path.pop()
                    return hasProp(result, prop) ? result[prop] : defaults
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
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
                writable: false,
                configurable: false,
                enumerable: false,
            },
            macro: {
                value(name, callback) {
                    const list = this.getMacro()
                    const macro = this.fn(callback)
                    const context = this
                    list[name] = function () {
                        return context.echo(macro.apply(undefined, arguments))
                    }
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            call: {
                value(name) {
                    const list = this.getMacro()
                    const macro = list[name]
                    const params = [].slice.call(arguments, 1)
                    if (isFunction(macro)) {
                        return macro.apply(macro, params)
                    }
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
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
                writable: false,
                configurable: false,
                enumerable: false,
            },
            include: {
                value(path, data, cx) {
                    const context = cx === false ? {} : this.clone(true)
                    const params = extend(context, data || {})
                    const promise = this.render(path, params)
                    this.echo(promise)
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            use: {
                value(path, namespace) {
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
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            async: {
                value(promise, callback) {
                    this.echo(
                        resolve(
                            promise,
                            function (data) {
                                return this.fn(callback)(data)
                            },
                            this
                        )
                    )
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            each: {
                value: function (object, callback) {
                    if (isString(object)) {
                        object = this.get(object, [])
                    }
                    each(object, callback)
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
            element: {
                value(tag, attr, content) {
                    return element(tag, attr, content)
                },
            },
            el: {
                value(tag, attr, content) {
                    if (isFunction(content)) {
                        content = this.fn(content)()
                    }
                    this.echo(
                        resolve(
                            content,
                            function (content) {
                                return this.element(tag, attr, content)
                            },
                            this
                        )
                    )
                },
                writable: false,
                configurable: false,
                enumerable: false,
            },
        })
    }
    this.configure(config)
}
