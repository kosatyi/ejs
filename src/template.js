import fs from 'fs'
import { instanceOf, isNode } from './utils.js'
import { isFunction } from './type.js'
import { Cache } from './cache.js'
import { Compiler } from './compiler.js'

const resolvePath = (path, template) => {
    template = [path, template].join('/')
    template = template.replace(/\/\//g, '/')
    return template
}

const httpRequest = (path, template) => {
    return fetch(resolvePath(path, template)).then((response) =>
        response.text()
    )
}

const fileSystem = (path, template) => {
    return new Promise((resolve, reject) => {
        fs.readFile(resolvePath(path, template), (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data.toString())
            }
        })
    })
}

const fileResolver = (resolver) => {
    return isFunction(resolver) ? resolver : isNode() ? fileSystem : httpRequest
}

export function Template(config, cache, compiler) {
    if (instanceOf(this, Template) === false)
        return new Template(config, cache, compiler)
    if (instanceOf(cache, Cache) === false)
        throw new TypeError('cache is not instance of Cache')
    if (instanceOf(compiler, Compiler) === false)
        throw new TypeError('compiler is not instance of Compiler')
    const template = {}
    const result = function (template, content) {
        cache.set(template, content)
        return content
    }
    const resolve = function (path) {
        return template.resolver(template.path, path)
    }
    const compile = function (content, template) {
        if (isFunction(content)) {
            return content
        } else {
            return compiler.compile(content, template)
        }
    }
    this.configure = function (config) {
        template.path = config.path
        template.cache = config.cache
        template.resolver = fileResolver(config.resolver)
    }
    this.get = function (template) {
        if (cache.exist(template)) {
            return cache.resolve(template)
        }
        return result(
            template,
            resolve(template).then((content) =>
                result(template, compile(content, template))
            )
        )
    }
    this.configure(config)
}
