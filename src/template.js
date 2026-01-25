import { isFunction } from './type.js'


export const Template = (options, cache, compiler) => {
    const config = {
        path: null,
        resolver: null
    }
    const resolve = (path) => {
        return config.resolver(config.path, path)
    }
    const result = (template, content) => {
        cache.set(template, content)
        return content
    }
    const compile = (content, template) => {
        if (isFunction(content)) {
            return content
        } else {
            return compiler.compile(content, template)
        }
    }
    const get = (template) => {
        if (cache.exist(template)) {
            return cache.resolve(template)
        }
        return resolve(template).then((content) =>
            result(template, compile(content, template))
        )
    }
    const configure = (options) => {
        config.path = options.path
        if (isFunction(options.resolver)) {
            config.resolver = options.resolver
        }
    }
    configure(options)
    return {
        get,
        configure,
        compile
    }
}
