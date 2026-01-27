import { ejsDefaults } from './defaults.js'
import { isFunction, isString, typeProp, isBoolean, isArray } from './type.js'
export const configSchema = (config, options) => {
    return Object.assign(config, {
        path: typeProp(isString, ejsDefaults.path, config.path, options.path),
        export: typeProp(
            isString,
            ejsDefaults.export,
            config.export,
            options.export,
        ),
        resolver: typeProp(
            isFunction,
            ejsDefaults.resolver,
            config.resolver,
            options.resolver,
        ),
        extension: typeProp(
            isString,
            ejsDefaults.extension,
            config.extension,
            options.extension,
        ),
        withObject: typeProp(
            isBoolean,
            defaults.withObject,
            config.withObject,
            options.withObject,
        ),
        rmWhitespace: typeProp(
            isBoolean,
            ejsDefaults.rmWhitespace,
            config.rmWhitespace,
            options.rmWhitespace,
        ),
        cache: typeProp(
            isBoolean,
            ejsDefaults.cache,
            config.cache,
            options.cache,
        ),
        token: Object.assign(
            {},
            ejsDefaults.token,
            config.token,
            options.token,
        ),
        vars: Object.assign({}, ejsDefaults.vars, config.vars, options.vars),
        globalHelpers: typeProp(
            isArray,
            ejsDefaults.globalHelpers,
            config.globalHelpers,
            options.globalHelpers,
        ),
    })
}
