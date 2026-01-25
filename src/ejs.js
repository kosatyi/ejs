import { configSchema } from './schema.js'
import { ext, extend, bindContext } from './utils.js'
import { isFunction } from './type.js'
import { Template } from './template.js'
import { Compiler } from './compiler.js'
import { Cache } from './cache.js'
import { Context } from './context.js'

export const EJS = (options = {}) => {
    const config = configSchema({}, options)
    const methods = {}
    const context = Context(config, methods)
    const compiler = Compiler(config)
    const cache = Cache(config)
    const template = Template(config, cache, compiler)
    const configure = (options = {}) => {
        configSchema(config, options || {})
        context.configure(config, methods)
        compiler.configure(config)
        cache.configure(config)
        template.configure(config)
        return config
    }
    const filePath = (name) => {
        return ext(name, config.extension)
    }
    const require = (name) => {
        const scope = createContext({})
        return output(filePath(name), scope).then(() => scope.getMacro())
    }
    const render = (name, data) => {
        const scope = createContext(data)
        return output(filePath(name), scope).then(outputContent(name, scope))
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
        return output(filePath(name), scope).then(outputContent(name, scope))
    }
    const helpers = (extendMethods) => {
        context.helpers(extend(methods, extendMethods))
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
        const params = [scope, scope.useComponent, scope.useElement, scope.getBuffer(), scope.useSafeValue]
        const globals = config.globalHelpers
            .filter((name) => isFunction(scope[name]))
            .map((name) => scope[name].bind(scope))
        return template
            .get(path)
            .then((callback) => callback.apply(scope, params.concat(globals)))
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
        helpers
    }
}



