import { configSchema } from './schema.js'
import { ext, extend, bindContext } from './utils.js'
import { isFunction } from './type.js'
import { Template } from './template.js'
import { Compiler } from './compiler.js'
import { Cache } from './cache.js'
import { Context } from './context.js'

export class EJS {
    #config = {}
    #extend = {}
    #context
    #compiler
    #cache
    #template
    constructor(options) {
        configSchema(this.#config, options || {})
        this.#context = new Context(this.#config, this.#extend)
        this.#compiler = new Compiler(this.#config)
        this.#cache = new Cache(this.#config)
        this.#template = new Template(this.#config, this.#cache, this.#compiler)
        //
        bindContext(this, [
            'configure',
            'create',
            'render',
            'require',
            'context',
            'preload',
            'compile',
            'helpers',
        ])
        //
        this.helpers({ require: this.require, render: this.render })
    }
    configure(options) {
        configSchema(this.#config, options || {})
        this.#context.configure(this.#config, this.#extend)
        this.#compiler.configure(this.#config)
        this.#cache.configure(this.#config)
        this.#template.configure(this.#config)
        return this.#config
    }
    render(name, data) {
        const filepath = ext(name, this.#config.extension)
        const scope = this.context(data)
        return this.#output(filepath, scope).then((content) => {
            if (scope.getExtend()) {
                scope.setExtend(false)
                const layout = scope.getLayout()
                const data = scope.clone()
                return this.render(layout, data)
            }
            return content
        })
    }
    helpers(methods) {
        this.#context.helpers(extend(this.#extend, methods))
    }
    context(data) {
        return this.#context.create(data)
    }
    compile(content, path) {
        return this.#compiler.compile(content, path)
    }
    preload(list) {
        return this.#cache.load(list || {})
    }
    create(options) {
        return new this.constructor(options)
    }
    require(name) {
        const filepath = ext(name, this.#config.extension)
        const scope = this.context({})
        return this.#output(filepath, scope).then(() => scope.getMacro())
    }
    #output(path, scope) {
        const { globalHelpers } = this.#config
        const params = [
            scope,
            scope.getBuffer(),
            scope.useSafeValue,
            scope.useComponent,
            scope.useElement,
        ].concat(
            globalHelpers
                .filter((name) => isFunction(scope[name]))
                .map((name) => scope[name].bind(scope))
        )
        return this.#template
            .get(path)
            .then((callback) => callback.apply(scope, params))
    }
}
