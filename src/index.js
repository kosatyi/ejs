import path from 'path'
import { defaults } from './defaults'
import { element } from './element'
import { extend, safeValue, ext } from './utils'
import { isFunction, isString, typeProp, isBoolean } from './type'
import { Compiler } from './compiler'
import { Template } from './template'
import { Context } from './context'
import { Cache } from './cache'

const configSchema = (config, options) => {
    extend(config, {
        export: typeProp(
            isString,
            defaults.export,
            config.export,
            options.export
        ),
        path: typeProp(isString, defaults.path, config.path, options.path),
        resolver: typeProp(
            isFunction,
            defaults.resolver,
            config.resolver,
            options.resolver
        ),
        extension: typeProp(
            isString,
            defaults.extension,
            config.extension,
            options.extension
        ),
        withObject: typeProp(
            isBoolean,
            defaults.withObject,
            config.withObject,
            options.withObject
        ),
        rmWhitespace: typeProp(
            isBoolean,
            defaults.rmWhitespace,
            config.rmWhitespace,
            options.rmWhitespace
        ),
        token: extend({}, defaults.token, config.token, options.token),
        vars: extend({}, defaults.vars, config.vars, options.vars),
    })
}

const init = (options) => {
    /**
     * EJS template
     * @module ejs
     */
    const config = {}
    const scope = {}

    configSchema(config, options || {})

    const context = new Context(config)
    const compiler = new Compiler(config)
    const cache = new Cache(config)
    const template = new Template(config, cache, compiler)

    const configure = (options) => {
        configSchema(config, options)
        context.configure(config, scope)
        compiler.configure(config)
        cache.configure(config)
        template.configure(config)
        return config
    }

    const output = (path, scope) => {
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
        context.helpers(extend(scope, methods || {}))
    }

    const __express = (name, options, callback) => {
        if (isFunction(options)) {
            callback = options
            options = {}
        }
        options = options || {}
        const settings = extend({}, options.settings)
        const viewPath = typeProp(isString, defaults.path, settings['views'])
        const viewCache = typeProp(
            isBoolean,
            defaults.cache,
            settings['view cache']
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
    compile,
    create,
    preload,
    __express,
} = init({})
