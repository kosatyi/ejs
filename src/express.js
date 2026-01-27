import path from 'node:path'
import { ejsDefaults } from './defaults.js'
import { isBoolean, isFunction, isString, typeProp } from './type.js'
/**
 *
 * @param {function(config: object):object} configure
 * @param {function(name: string, data?: object):Promise<string>} render
 * @return {function(name:any, options:any, callback: any): Promise<void>}
 */
export const expressRenderer = (configure, render) => {
    return function (name, options, callback) {
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
}
