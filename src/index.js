import path from 'path'
import defaults from './defaults'
import { extend, safeValue, ext } from './utils'
import { isFunction, isString, typeProp, isBoolean } from './type'
import element from './element'

import configureCompiler from './compiler'
import configureWrapper from './wrapper'
import configureTemplate from './template'
import configureScope from './scope'
import configureCache from './cache'

function create(options) {
    const config = {}
    const ejs = {
        safeValue: safeValue,
        element: element,
        output(path, scope) {
            return ejs.template(path).then(function (template) {
                return template.call(scope, scope, scope.getBuffer(), safeValue)
            })
        },
        render(name, data) {
            const filepath = ext(name, config.extension)
            const scope = new ejs.scope(data)
            return ejs.output(filepath, scope).then((content) => {
                if (scope.getExtend()) {
                    scope.setExtend(false)
                    const layout = scope.getLayout()
                    const data = scope.clone()
                    return ejs.render(layout, data)
                }
                return content
            })
        },
        require(name) {
            const filepath = ext(name, config.extension)
            const scope = new ejs.scope({})
            return ejs.output(filepath, scope).then(() => {
                return scope.getMacro()
            })
        },
        helpers(methods) {
            ejs.scope.helpers(methods)
        },
        configure(options) {
            config.export = typeProp(isString, defaults.export, options.export)
            config.path = typeProp(isString, defaults.path, options.path)
            config.resolver = typeProp(
                isFunction,
                defaults.resolver,
                options.resolver
            )
            config.extension = typeProp(
                isString,
                defaults.extension,
                options.extension
            )
            config.withObject = typeProp(
                isBoolean,
                defaults.withObject,
                options.withObject
            )
            config.token = extend({}, defaults.token, options.token)
            config.vars = extend({}, defaults.vars, options.vars)
            ejs.scope = configureScope(ejs, config)
            ejs.compile = configureCompiler(ejs, config)
            ejs.wrapper = configureWrapper(ejs, config)
            ejs.cache = configureCache(ejs, config)
            ejs.template = configureTemplate(ejs, config)
            return ejs
        },
        __express(name, options, callback) {
            if (isFunction(options)) {
                callback = options
                options = {}
            }
            options = options || {}
            const settings = extend({}, options.settings)
            const viewPath = typeProp(
                isString,
                settings['views'],
                defaults.path
            )
            const viewCache = typeProp(
                isBoolean,
                settings['view cache'],
                defaults.cache
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
        },
    }
    ejs.configure(options || {})
    ejs.helpers({
        require(name) {
            return ejs.require(name, this)
        },
        render(name, data) {
            return ejs.render(name, data)
        },
    })
    return ejs
}

const instance = create()

instance.create = create

export default instance
