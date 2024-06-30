import { configSchema } from './schema'
import { Template } from './template'
import { Compiler } from './compiler'
import { Cache } from './cache'
import { Context } from './context'
import { ext, safeValue, instanceOf } from './utils'

export function EJS(options) {
    if (instanceOf(this, EJS) === false) return new EJS(options)
    const scope = {}
    const config = {}
    configSchema(config, options || {})
    const context = new Context(config)
    const compiler = new Compiler(config)
    const cache = new Cache(config)
    const template = new Template(config, cache, compiler)
    const output = function (path, scope) {
        return template.get(path).then(function (callback) {
            return callback.call(
                scope,
                scope,
                scope.getComponent(),
                scope.getBuffer(),
                safeValue
            )
        })
    }
    const require = function (name) {
        const filepath = ext(name, config.extension)
        const scope = context.create({})
        return output(filepath, scope).then(() => {
            return scope.getMacro()
        })
    }

    const render = function (name, data) {
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
        context.helpers(Object.assign(scope, methods || {}))
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
}
