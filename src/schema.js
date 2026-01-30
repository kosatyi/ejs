import { ejsDefaults } from './config.js'
import {
    isFunction,
    isString,
    typeProp,
    isBoolean,
    isArrayOfVariables,
    isArray,
} from './type.js'

export const configSchema = (config, options) => {
    return Object.assign(config, {
        path: typeProp(isString, ejsDefaults.path, config.path, options.path),
        precompiled: typeProp(
            isString,
            ejsDefaults.precompiled,
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
        strict: typeProp(
            isBoolean,
            ejsDefaults.strict,
            config.strict,
            options.strict,
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
        globals: typeProp(
            isArray,
            ejsDefaults.globals,
            config.globals,
            isArrayOfVariables(options.globals),
        ),
        token: Object.assign(
            {},
            ejsDefaults.token,
            config.token,
            options.token,
        ),
        vars: Object.assign({}, ejsDefaults.vars, config.vars, options.vars),
    })
}
