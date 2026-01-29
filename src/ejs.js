import { configSchema } from './schema.js'
import { ext } from './utils.js'
import { isFunction } from './type.js'
import { Template } from './template.js'
import { Compiler } from './compiler.js'
import { Cache } from './cache.js'
import { Context } from './context.js'
/**
 * @param {EjsConfig} options
 */
export const EJS = (options) => {
    const config = configSchema({}, options)
    const methods = {}
    const context = Context(config, methods)
    const compiler = Compiler(config)
    const cache = Cache(config)
    const template = Template(config, cache, compiler)
    const configure = (options) => {
        if (options) {
            Object.keys(methods).forEach(removeMethod)
            configSchema(config, options)
            context.configure(config, methods)
            compiler.configure(config)
            cache.configure(config)
            template.configure(config)
        }
        return config
    }
    const templateFile = (name) => {
        return ext(name, config.extension)
    }
    const removeMethod = (name) => {
        delete methods[name]
    }
    const require = (name) => {
        const scope = createContext({})
        return output(templateFile(name), scope).then(() => scope.getMacro())
    }
    const render = (name, data) => {
        const scope = createContext(data)
        return output(templateFile(name), scope).then(
            outputContent(name, scope),
        )
    }
    const outputContent = (name, scope) => {
        return (content) => {
            if (scope.getExtend()) {
                scope.setExtend(false)
                return renderLayout(scope.getLayout(), scope, name)
            }
            return content
        }
    }
    const renderLayout = (name, data, parent) => {
        const scope = createContext(data)
        if (parent) scope.setParentTemplate(parent)
        return output(templateFile(name), scope).then(
            outputContent(name, scope),
        )
    }
    const helpers = (extendMethods) => {
        context.helpers(Object.assign(methods, extendMethods))
    }
    const createContext = (data) => {
        return context.create(data)
    }
    const compile = (content, path) => {
        return compiler.compile(content, path)
    }
    const preload = (list) => {
        return cache.load(list || {})
    }
    const create = (config) => {
        return EJS(config)
    }
    const output = (path, scope) => {
        const params = [
            scope,
            scope.useComponent,
            scope.useElement,
            scope.getBuffer(),
            scope.useSafeValue,
        ]
        return template
            .get(path)
            .then((callback) =>
                callback.apply(scope, params.concat(context.globals())),
            )
    }
    helpers({ render, require })
    return {
        configure,
        create,
        createContext,
        render,
        require,
        preload,
        compile,
        helpers,
    }
}
