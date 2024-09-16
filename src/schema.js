import { isFunction, isString, typeProp, isBoolean, isArray } from './type.js'
import { extend } from './utils.js'
import { defaults } from './defaults.js'

export const configSchema = (config, options) => {
    extend(config, {
        path: typeProp(isString, defaults.path, config.path, options.path),
        export: typeProp(
            isString,
            defaults.export,
            config.export,
            options.export
        ),
        resolver: typeProp(
            isFunction,
            defaults.resolver,
            config.resolver,
            options.resolver
        ),
        extension: typeProp(
            isString,
            defaults.extension,
            config.extension,
            options.extension
        ),
        withObject: typeProp(
            isBoolean,
            defaults.withObject,
            config.withObject,
            options.withObject
        ),
        rmWhitespace: typeProp(
            isBoolean,
            defaults.rmWhitespace,
            config.rmWhitespace,
            options.rmWhitespace
        ),
        cache: typeProp(isBoolean, defaults.cache, config.cache, options.cache),
        token: extend({}, defaults.token, config.token, options.token),
        vars: extend({}, defaults.vars, config.vars, options.vars),
        globalHelpers: typeProp(
            isArray,
            defaults.globalHelpers,
            config.globalHelpers,
            options.globalHelpers
        ),
    })
}
