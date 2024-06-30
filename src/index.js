import path from 'path'

import { isBoolean, isFunction, isString, typeProp } from './type.js'
import { extend } from './utils.js'
import { defaults } from './defaults.js'

export { element, safeValue } from './element.js'
export { EJS } from './ejs.js'

import { configure, render } from './instance.js'

export {
    context,
    render,
    configure,
    compile,
    helpers,
    preload,
    create,
} from './instance.js'

export function __express(name, options, callback) {
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
