import { isFunction, isString, typeProp, isBoolean, isObject } from './type'
import { extend } from './utils'
import { defaults } from './defaults'

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
        cache: typeProp(isBoolean, defaults.watch, config.watch, options.watch),
        token: extend({}, defaults.token, config.token, options.token),
        vars: extend({}, defaults.vars, config.vars, options.vars),
    })
}
