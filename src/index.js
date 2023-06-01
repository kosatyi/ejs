import path from 'path'
import { defaults } from './defaults'
import { element } from './element'
import { extend, safeValue, ext } from './utils'
import { isFunction, isString, typeProp, isBoolean } from './type'
import { Compiler } from './compiler'
import { Bundler } from './bundler'
import { Template } from './template'
import { Context } from './context'
import { Cache } from './cache'

const configSchema = (config, options) => {
    extend(config, {
        export: typeProp(isString, defaults.export, options.export),
        path: typeProp(isString, defaults.path, options.path),
        resolver: typeProp(isFunction, defaults.resolver, options.resolver),
        extension: typeProp(isString, defaults.extension, options.extension),
        withObject: typeProp(
            isBoolean,
            defaults.withObject,
            options.withObject
        ),
        token: extend({}, defaults.token, options.token),
        vars: extend({}, defaults.vars, options.vars),
    })
}

const init = (options) => {
    /**
     * EJS template
     * @module ejs
     */
    const config = {}
    const functions = {}

    configSchema(config, options || {})

    const context = new Context(config)
    const compiler = new Compiler(config)
    const bundler = new Bundler(config)
    const cache = new Cache(config)
    const template = new Template(config, cache, compiler)

    const configure = (options) => {
        configSchema(config, options)
        context.configure(config)
        compiler.configure(config)
        bundler.configure(config)
        cache.configure(config)
        template.configure(config)
    }

    const output = (path, scope) => {
        return template.get(path).then(function (callback) {
            return callback.call(scope, scope, scope.getBuffer(), safeValue)
        })
    }

    const require = (name) => {
        const filepath = ext(name, config.extension)
        const scope = context.create({})
        return output(filepath, scope).then(() => {
            return scope.getMacro()
        })
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

    const helpers = (methods) => {
        context.helpers(extend(callbacks, methods || {}))
    }

    const __express = (name, options, callback) => {
        if (isFunction(options)) {
            callback = options
            options = {}
        }
        options = options || {}
        const settings = extend({}, options.settings)
        const viewPath = typeProp(isString, settings['views'], defaults.path)
        const viewCache = typeProp(
            isBoolean,
            settings['view cache'],
            defaults.cache
        )
        const viewOptions = extend({}, settings['view options'])
        const filename = path.relative(viewPath, name)
        viewOptions.path = viewPath
        viewOptions.cache = viewCache
        configure(viewOptions)
        return render(filename, options)
            .then((content) => {
                callback(null, content)
            })
            .catch((error) => {
                callback(error)
            })
    }
    const preload = (list) => cache.load(list)
    const wrapper = (list) => bundler.wrapper(list)
    const compile = (content, path) => compiler.compile(content, path)
    const create = (options) => {
        return init(options)
    }
    helpers({
        require(name) {
            return require(name, this)
        },
        render(name, data) {
            return render(name, data)
        },
    })
    return {
        render,
        helpers,
        configure,
        wrapper,
        compile,
        create,
        preload,
        __express,
    }
}

export { element, safeValue }

export const {
    render,
    helpers,
    configure,
    wrapper,
    compile,
    create,
    preload,
    __express,
} = init({})
