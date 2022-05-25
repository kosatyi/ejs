let fs, path

try {
    fs = require('fs')
    path = require('path')
} catch (e) {
    fs = null
    path = null
}

function Loader(loader, extension) {
    this.loader = loader
    this.extension = extension
}

Loader.prototype = {
    loaders: {
        filesystem(template) {
            return fs.readFileSync(template).toString()
        },
        browser(template) {
            const xhr = new XMLHttpRequest()
            template = template.concat('?').concat(new Date().getTime())
            xhr.open('GET', template, false)
            xhr.send(null)
            return xhr.responseText
        },
    },
    resolveFile(template) {
        let loader
        if (fs && path) {
            loader = this.loaders.filesystem.bind(this)
        } else {
            loader = this.loaders.browser.bind(this)
        }
        return loader(template)
    },
    normalizePath(template) {
        let ext = template.split('.').pop()
        template = [this.loader.path, template].join('/')
        template = template.replace(/\/\//g, '/')
        if (template.charAt(0) === '/') {
            template = template.slice(1)
        }
        if (this.extension.supported.indexOf(ext) === -1) {
            template = [template, this.extension.default].join('.')
        }
        return template
    },
    fetch(template) {
        template = this.normalizePath(template)
        return this.resolveFile(template)
    },
}

module.exports = Loader
