const fs = require('fs')

function HttpRequest(template) {
    return global.fetch(template).then(function (response) {
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
        this.resolver = config.browser ? HttpRequest : FileSystem
    }
    this.path = config.path
    this.token = config.token || {}
    this.module = config.extension.module
    this.default = config.extension.default
    this.supported = config.extension.supported || []
    this.supported.push(this.module)
    this.supported.push(this.default)
}

Loader.prototype = {
    normalize(template) {
        let ext = template.split('.').pop()
        template = [this.path, template].join('/')
        template = template.replace(/\/\//g, '/')
        if (template.charAt(0) === '/') {
            template = template.slice(1)
        }
        if (this.supported.indexOf(ext) === -1) {
            template = [template, this.default].join('.')
        }
        return template
    },
    resolve(template) {
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
        let template = this.normalize(path)
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
