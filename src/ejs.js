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
        bindContext(this, ['configure', 'create', 'render', 'require', 'context', 'preload', 'compile', 'helpers'])
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

    filePath(name) {
        return ext(name, this.#config.extension)
    }

    require(name) {
        const scope = this.context({})
        return this.#output(this.filePath(name), scope).then(() => scope.getMacro())
    }

    render(name, data) {
        const scope = this.context(data)
        return this.#output(this.filePath(name), scope).then(this.outputContent(name, scope))
    }

    outputContent(name, scope) {
        return (content) => {
            if (scope.getExtend()) {
                scope.setExtend(false)
                return this.renderLayout(scope.getLayout(), scope, name)
            }
            return content
        }
    }

    renderLayout(name, data, parent) {
        const scope = this.context(data)
        if (parent) scope.setParentTemplate(parent)
        return this.#output(this.filePath(name), scope).then(this.outputContent(name, scope))
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

    #output(path, scope) {
        const { globalHelpers } = this.#config
        const params = [scope, scope.useComponent, scope.useElement, scope.getBuffer(), scope.useSafeValue]
        const globals = globalHelpers
            .filter((name) => isFunction(scope[name]))
            .map((name) => scope[name].bind(scope))
        return this.#template
            .get(path)
            .then((callback) => callback.apply(scope, params.concat(globals)))
    }
}
