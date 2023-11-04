import { configSchema } from './schema'
import { Template } from './template'
import { Compiler } from './compiler'
import { Cache } from './cache'
import { Context } from './context'
import { ext, extend, safeValue, bindContext } from './utils'
import { isBoolean, isFunction, isString, typeProp } from './type'
import { defaults } from './defaults'
import path from 'path'

export class EJS {
    export = [
        'cache',
        'render',
        'require',
        'helpers',
        'configure',
        'preload',
        'compiler',
        '__express',
    ]
    constructor(options = {}) {
        this.config = {}
        this.scope = {}
        configSchema(this.config, options)
        bindContext(this, this, this.export)
        this.context = new Context(this.config)
        this.compiler = new Compiler(this.config)
        this.cache = new Cache(this.config)
        this.template = new Template(this.config, this.cache, this.compiler)
        this.helpers({ require: this.require, render: this.render })
    }
    configure(options = {}) {
        configSchema(this.config, options)
        this.context.configure(this.config, this.scope)
        this.compiler.configure(this.config)
        this.cache.configure(this.config)
        this.template.configure(this.config)
        return this.config
    }
    output(path, scope) {
        return this.template.get(path).then(function (callback) {
            return callback.call(
                scope,
                scope,
                scope.getComponent(),
                scope.getBuffer(),
                safeValue
            )
        })
    }
    render(name, data) {
        const filepath = ext(name, this.config.extension)
        const scope = this.context.create(data)
        return this.output(filepath, scope).then((content) => {
            if (scope.getExtend()) {
                scope.setExtend(false)
                const layout = scope.getLayout()
                const data = scope.clone()
                return this.render(layout, data)
            }
            return content
        })
    }
    require(name) {
        const filepath = ext(name, this.config.extension)
        const scope = this.context.create({})
        return this.output(filepath, scope).then(() => {
            return scope.getMacro()
        })
    }
    create(options = {}) {
        return new EJS(options)
    }
    helpers(methods = {}) {
        this.context.helpers(extend(this.scope, methods))
    }
    preload(list = {}) {
        return this.cache.load(list)
    }
    compile(content, path) {
        return this.compiler.compile(content, path)
    }
    __express(name, options, callback) {
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
        this.configure(viewOptions)
        return this.render(filename, options)
            .then((content) => {
                callback(null, content)
            })
            .catch((error) => {
                callback(error)
            })
    }
}
