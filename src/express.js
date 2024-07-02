import { isBoolean, isFunction, isString, typeProp } from './type.js'
import { extend } from './utils.js'
import { defaults } from './defaults.js'
import path from 'path'

/**
 *
 * @param {EJS} ejs
 * @return {function(name, options, callback): Promise<String>}
 */
export function expressRenderer(ejs) {
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
        ejs.configure(viewOptions)
        return ejs
            .render(filename, options)
            .then((content) => {
                callback(null, content)
            })
            .catch((error) => {
                callback(error)
            })
    }
}
