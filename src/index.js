import fs from 'node:fs/promises'
import path from 'node:path'
import { joinPath } from './ejs/utils.js'
import { isBoolean, isFunction, isString, typeProp } from './ejs/type.js'
import { EjsInstance } from './ejs/index.js'
import { ejsDefaults } from './ejs/config.js'

export { element, escapeValue } from './element.js'

const resolver = async (path, template, error) => {
    return fs
        .readFile(joinPath(path, template))
        .then((contents) => contents.toString())
        .catch((e) => {
            if (e.code === 'ENOENT') {
                return error(1, `template ${template} not found`)
            }
            return error(0, e)
        })
}

export const {
    render,
    helpers,
    configure,
    create,
    createContext,
    compile,
    preload,
} = new EjsInstance({
    resolver,
})

export const __express = function (name, options, callback) {
    if (isFunction(options)) {
        callback = options
        options = {}
    }
    options = options || {}
    const settings = Object.assign({}, options.settings)
    const viewPath = typeProp(isString, ejsDefaults.path, settings['views'])
    const viewCache = typeProp(
        isBoolean,
        ejsDefaults.cache,
        settings['view cache'],
    )
    const viewOptions = Object.assign({}, settings['view options'])
    const filename = path.relative(viewPath, name)
    viewOptions.path = viewPath
    viewOptions.cache = viewCache
    configure(viewOptions)
    return render(filename, options)
        .then((content) => {
            callback(null, content)
        })
        .catch((error) => {
            callback(error)
        })
}
