import fs from 'fs'
import { instanceOf, isNode } from './utils'
import { isFunction } from './type'

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

    const watcher = function (config) {
        if (template.watcher) {
            template.watcher.unwatch('.')
        }
        if (config.watch && config.chokidar && isNode()) {
            return config.chokidar
                .watch('.', { cwd: template.path })
                .on('change', (name) => {
                    cache.remove(name)
                })
        }
    }
    this.configure = function (config) {
        template.path = config.path
        template.chokidar = config.chokidar
        template.resolver = fileResolver(config.resolver)
        template.watcher = watcher(config)
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
