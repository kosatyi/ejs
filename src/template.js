import fs from 'fs'
import chokidar from 'chokidar'
import { isNode } from './utils'
import { isFunction } from './type'

const httpRequest = (template) => {
    return fetch(template).then((response) => response.text())
}

const fileSystem = (template) =>
    new Promise((resolve, reject) => {
        fs.readFile(template, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data.toString())
            }
        })
    })

const enableWatcher = (path, cache) =>
    chokidar
        .watch('.', {
            cwd: path,
        })
        .on('change', (name) => {
            cache.remove(name)
        })
        .on('error', (error) => {
            console.log('watcher error: ' + error)
        })

const normalizePath = (path, template) => {
    template = [path, template].join('/')
    template = template.replace(/\/\//g, '/')
    return template
}

export class Template {
    constructor(config, cache, compiler) {
        this.cache = cache
        this.compiler = compiler
        this.configure(config)
    }
    configure(config) {
        this.path = config.path
        this.resolver = isFunction(config.resolver)
            ? config.resolver
            : isNode()
            ? fileSystem
            : httpRequest
    }
    resolve(template) {
        return this.resolver(normalizePath(this.path, template))
    }
    result(content, template) {
        this.cache.set(template, content)
        return content
    }
    get(template) {
        if (this.cache.exist(template)) {
            return this.cache.resolve(template)
        }
        const content = this.resolve(template).then((content) =>
            this.result(this.compiler.compile(content, template), template)
        )
        return this.result(content, template)
    }
}
