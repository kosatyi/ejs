const { hasProp, uuid } = require('./utils')

function configure(loader, extension) {
    function extMissing(value) {
        return extension.supported.indexOf(value) === -1
    }
    function getPrecompiledTemplates() {
        let list = {}
        let prop = extension.export
        if (hasProp(window, prop)) {
            list = window[prop]
        }
        return list
    }
    function Template(name) {
        const list = getPrecompiledTemplates()
        const ext = name.split('.').pop()
        if (name.charAt(0) === '/') {
            name = name.slice(1)
        }
        if (extMissing(ext)) {
            name = [name, extension.default].join('.')
        }
        if (hasProp(list, name)) {
            return list[name]
        }
        const id = uuid(name)
        if (hasProp(list, id)) {
            return list[id]
        }
        return (list[id] = compile(name, '.ejs'))
    }
    return Template
}

module.exports = configure
