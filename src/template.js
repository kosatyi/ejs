import fs from 'fs'
import chokidar from 'chokidar'
import { isNode } from './utils'
import { isFunction } from './type'

const HttpRequest = (template) =>
    window.fetch(template).then((response) => response.text())

const FileSystem = (template) =>
    new Promise((resolve, reject) => {
        fs.readFile(template, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data.toString())
            }
        })
    })

const Watcher = (path, cache) =>
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

const Template = (config, cache, compile) => {
    const path = config.path
    const token = config.token || {}
    const resolver = isFunction(config.resolver)
        ? config.resolver
        : isNode()
        ? FileSystem
        : HttpRequest

    const normalize = (template) => {
        template = [path, template].join('/')
        template = template.replace(/\/\//g, '/')
        return template
    }
    const resolve = (template) => {
        return resolver(normalize(template))
    }
    const result = (content, template) => {
        cache.set(template, content)
        return content
    }
    const get = (template) => {
        if (cache.exist(template)) {
            return cache.resolve(template)
        }
        const content = resolve(template).then((content) =>
            result(compile(content, template), template)
        )
        return result(content, template)
    }
    if (config.watch && isNode()) {
        Watcher(path, cache)
    }
    return get
}

export default Template
