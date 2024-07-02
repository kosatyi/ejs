import { instanceOf } from './utils.js'
import { isFunction } from './type.js'
import { Cache } from './cache.js'
import { Compiler } from './compiler.js'

export function Template(config, cache, compiler) {
    if (instanceOf(this, Template) === false)
        return new Template(config, cache, compiler)

    if (instanceOf(cache, Cache) === false)
        throw new TypeError('cache is not instance of Cache')

    if (instanceOf(compiler, Compiler) === false)
        throw new TypeError('compiler is not instance of Compiler')

    const template = {}

    const result = (template, content) => {
        cache.set(template, content)
        return content
    }

    const resolve = (path) => {
        return template.resolver(template.path, path)
    }

    const compile = (content, template) => {
        if (isFunction(content)) {
            return content
        } else {
            return compiler.compile(content, template)
        }
    }

    this.configure = function (config) {
        template.path = config.path
        template.cache = config.cache
        if (isFunction(config.resolver)) {
            template.resolver = config.resolver
        }
    }

    this.get = function (template) {
        if (cache.exist(template)) {
            return cache.resolve(template)
        }
        return resolve(template).then((content) =>
            result(template, compile(content, template))
        )
    }
    this.configure(config)
}
