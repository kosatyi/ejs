import fs from 'fs'
import chokidar from 'chokidar'
import { isNode } from './utils'
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

const disableWatcher = (watcher) => {
    if (watcher) {
        watcher.unwatch('.')
    }
}

const enableWatcher = (path, cache) => {
    return chokidar
        .watch('.', {
            cwd: path,
        })
        .on('change', (name) => {
            cache.remove(name)
        })
        .on('error', (error) => {
            console.log('watcher error: ' + error)
        })
}

export class Template {
    constructor(config, cache, compiler) {
        this.cache = cache
        this.watcher = null
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
        disableWatcher(this.watcher)
        if (config.watch && isNode()) {
            this.watcher = enableWatcher(this.path, this.cache)
        }
    }
    resolve(template) {
        return this.resolver(this.path, template)
    }
    result(template, content) {
        this.cache.set(template, content)
        return content
    }
    compile(content, template) {
        if (isFunction(content)) {
            return content
        } else {
            return this.compiler.compile(content, template)
        }
    }
    get(template) {
        if (this.cache.exist(template)) {
            return this.cache.resolve(template)
        }
        const content = this.resolve(template).then((content) =>
            this.result(template, this.compile(content, template))
        )
        return this.result(template, content)
    }
}
