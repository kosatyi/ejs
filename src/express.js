import { isBoolean, isFunction, isString, typeProp } from './type.js'
import { extend } from './utils.js'
import { defaults } from './defaults.js'
import path from 'node:path'
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
        const settings = extend({}, options.settings)
        const viewPath = typeProp(isString, defaults.path, settings['views'])
        const viewCache = typeProp(
            isBoolean,
            defaults.cache,
            settings['view cache']
        )
        const viewOptions = extend({}, settings['view options'])
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
