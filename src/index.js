import path from 'path'
import defaults from './defaults'
import { extend, safeValue } from './utils'
import { isFunction, isString, typeProp } from './type'
import element from './element'
import Compiler from './compiler'
import Wrapper from './wrapper'
import Template from './template'
import Scope from './scope'
import Cache from './cache'

function init(options) {
    /**
     * @type {Object}
     */
    const config = {}
    const helpers = {}
    const ext = function (path, defaults) {
        const ext = path.split('.').pop()
        if (ext !== defaults) {
            path = [path, defaults].join('.')
        }
        return path
    }
    const view = {
        element,
        output(path, scope) {
            return view.template(path).then(function (template) {
                return template.call(scope, scope, scope.getBuffer(), safeValue)
            })
        },
        render(name, data) {
            const filepath = ext(name, config.extension.template)
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
        require(name) {
            const filepath = ext(name, config.extension.module)
            const scope = new view.scope({})
            return view.output(filepath, scope).then(() => {
                return scope.clone(true)
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
        __express(name, options, callback) {
            if (isFunction(options)) {
                callback = options
                options = {}
            }
            options = options || {}
            const settings = options.settings || {}
            const viewPath = settings['views']
            const viewOptions = settings['view options'] || {}
            const filename = path.relative(viewPath, name)
            viewOptions.path = viewPath
            view.configure(viewOptions)
            return view
                .render(filename, options)
                .then((content) => {
                    callback(null, content)
                })
                .catch((error) => {
                    callback(error)
                })
        },
    }
    /**
     *
     */
    view.configure(options || {})
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
