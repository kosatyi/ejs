import path from 'path'
import defaults from './defaults'
import { extend, safeValue } from './utils'
import { isFunction, isString, typeProp } from './type'
import Compiler from './compiler'
import Wrapper from './wrapper'
import Template from './template'
import Scope from './scope'
import Cache from './cache'

function init() {
    const config = {}
    const helpers = {}
    const ext = function (path, defaultExt) {
        const ext = path.split('.').pop()
        if (config.extension.supported.indexOf(ext) === -1) {
            path = [path, defaultExt].join('.')
        }
        return path
    }
    const view = {
        output(path, scope) {
            return view.template(path).then(function (template) {
                return template.call(scope, scope, scope.getBuffer(), safeValue)
            })
        },
        render(name, data) {
            const filepath = ext(name, config.extension.default)
            const scope = new view.scope(data)
            return view.output(filepath, scope).then((content) => {
                if (scope.getExtend()) {
                    scope.setExtend(false)
                    const layout = scope.getLayout()
                    const data = scope.clone()
                    return view.render(layout, data)
                }
                return content
            })
        },
        require(name, context) {
            const filepath = ext(name, config.extension.module)
            context.exports = extend({}, context.exports)
            context.module = context
            return view.output(filepath, context).then((content) => {
                return context.exports
            })
        },
        helpers(methods) {
            methods = methods || {}
            extend(helpers, methods)
            view.scope.helpers(methods)
        },
        configure(options) {
            config.export = typeProp(isString, defaults.export, options.export)
            config.path = typeProp(isString, defaults.path, options.path)
            config.resolver = typeProp(
                isFunction,
                defaults.resolver,
                options.resolver
            )
            config.extension = extend({}, defaults.extension, options.extension)
            config.token = extend({}, defaults.token, options.token)
            config.vars = extend({}, defaults.vars, options.vars)
            view.scope = Scope(config, helpers)
            view.compile = Compiler(config)
            view.wrapper = Wrapper(config)
            view.cache = Cache(config)
            view.template = Template(config, view.cache, view.compile)
            return view
        },
    }
    /**
     *
     * @param name
     * @param options
     * @param callback
     * @return {*}
     * @private
     */
    view.__express = function (name, options, callback) {
        if (isFunction(options)) {
            callback = options
            options = {}
        }
        options = options || {}
        const settings = options.settings || {}
        const viewPath = settings['views']
        const viewOptions = settings['view options'] || {}
        const filename = path.relative(viewPath, name)
        view.configure(viewOptions)
        return view
            .render(filename, options)
            .then(function (content) {
                callback(null, content)
            })
            .catch(function (error) {
                callback(error)
            })
    }
    /**
     *
     */
    view.configure({})
    /**
     *
     */
    view.helpers({
        require(name) {
            return view.require(name, this)
        },
        render(name, data) {
            return view.render(name, data)
        },
    })
    return view
}

export default init()
