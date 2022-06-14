const fs = require('fs')
const chokidar = require('chokidar')
const path = require('path')
const isNode = new Function(
    'try {return this===global;}catch(e){return false;}'
)

function HttpRequest(template) {
    return window.fetch(template).then(function (response) {
        return response.text()
    })
}

function FileSystem(template) {
    return new Promise(function (resolve, reject) {
        fs.readFile(template, (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data.toString())
            }
        })
    })
}

function Loader(cache, compiler, config) {
    this.cache = cache
    this.compiler = compiler
    if (typeof config.resolver === 'function') {
        this.resolver = config.resolver
    } else {
        this.resolver = isNode() ? FileSystem : HttpRequest
    }
    this.path = config.path
    this.token = config.token || {}
    this.module = config.extension.module
    this.default = config.extension.default
    this.supported = config.extension.supported || []
    this.supported.push(this.module)
    this.supported.push(this.default)
    if (config.watch && isNode()) {
        this.watch()
    }
}

Loader.prototype = {
    watch() {
        this.watcher = chokidar.watch('.', {
            cwd: this.path,
        })
        this.watcher.on(
            'change',
            function (ev, name) {
                this.cache.remove(name)
            }.bind(this)
        )
        this.watcher.on(
            'error',
            function (error) {
                console.log('watcher error: ' + error)
            }.bind(this)
        )
    },
    normalize(template) {
        template = [this.path, template].join('/')
        template = template.replace(/\/\//g, '/')
        return template
    },
    extension(template) {
        let ext = template.split('.').pop()
        if (this.supported.indexOf(ext) === -1) {
            template = [template, this.default].join('.')
        }
        return template
    },
    resolve(template) {
        template = this.normalize(template)
        return this.resolver(template).then(
            function (content) {
                return this.process(content, template)
            }.bind(this)
        )
    },
    process(content, template) {
        let extension = template.split('.').pop()
        if (this.module.indexOf(extension) > -1) {
            content = [this.token.start, content, this.token.end].join('\n')
        }
        return content
    },
    get(path) {
        let template = this.extension(path)
        if (this.cache.exist(template)) {
            return this.cache.resolve(template)
        }
        const content = this.resolve(template).then(
            function (content) {
                content = this.compiler.compile(content, template)
                return this.result(content, template)
            }.bind(this)
        )
        return this.result(content, template)
    },
    result(content, template) {
        this.cache.set(template, content)
        return content
    },
}

module.exports = Loader
