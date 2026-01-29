import { isFunction } from './type.js'
/**
 *
 * @param {EjsConfig} options
 * @param cache
 * @param compiler
 */
export const Template = (options, cache, compiler) => {
    /**
     * @type {Pick<EjsConfig, 'path' | 'resolver'>}
     */
    const config = {
        resolverOptions: {},
    }
    const resolve = (path) => {
        return Promise.resolve(config.resolver(config.path, path))
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
            result(template, compile(content, template)),
        )
    }
    /**
     * @param {EjsConfig} options
     */
    const configure = (options) => {
        config.path = options.path
        config.resolverOptions = options.resolverOptions || {}
        if (isFunction(options.resolver)) {
            config.resolver = options.resolver
        }
    }
    configure(options)
    return {
        get,
        configure,
        compile,
    }
}
