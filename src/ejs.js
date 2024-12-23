import { configSchema } from './schema.js'
import { Template } from './template.js'
import { Compiler } from './compiler.js'
import { Cache } from './cache.js'
import { Context } from './context.js'
import { ext, safeValue, instanceOf, extend } from './utils.js'
import { isFunction } from './type.js'

export function EJS(options) {
    if (instanceOf(this, EJS) === false) return new EJS(options)

    const scope = {}
    const config = {}

    configSchema(config, options || {})

    const context = new Context(config)
    const compiler = new Compiler(config)
    const cache = new Cache(config)
    const template = new Template(config, cache, compiler)

    const output = (path, scope) => {
        const { globalHelpers } = config
        const params = [
            scope,
            scope.getComponent(),
            scope.getBuffer(),
            safeValue,
        ].concat(
            globalHelpers
                .filter((name) => isFunction(scope[name]))
                .map((name) => scope[name].bind(scope))
        )
        return template
            .get(path)
            .then((callback) => callback.apply(scope, params))
    }

    const require = (name) => {
        const filepath = ext(name, config.extension)
        const scope = context.create({})
        return output(filepath, scope).then(() => scope.getMacro())
    }
    const render = (name, data) => {
        const filepath = ext(name, config.extension)
        const scope = context.create(data)
        return output(filepath, scope).then((content) => {
            if (scope.getExtend()) {
                scope.setExtend(false)
                const layout = scope.getLayout()
                const data = scope.clone()
                return render(layout, data)
            }
            return content
        })
    }
    this.configure = function (options) {
        options = options || {}
        configSchema(config, options)
        context.configure(config, scope)
        compiler.configure(config)
        cache.configure(config)
        template.configure(config)
        return config
    }
    this.render = function (name, data) {
        return render(name, data)
    }
    this.helpers = function (methods) {
        context.helpers(extend(scope, methods))
    }
    this.preload = function (list) {
        return cache.load(list || {})
    }
    this.create = function (options) {
        return new EJS(options)
    }
    this.compile = function (content, path) {
        return compiler.compile(content, path)
    }
    this.context = function (data) {
        return context.create(data)
    }
    this.helpers({ require, render })
    return this
}
