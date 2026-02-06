import { configSchema } from './schema.js'
import { bindContext } from './utils.js'
import { EjsTemplate } from './template.js'
import { EjsCompiler } from './compiler.js'
import { EjsCache } from './cache.js'
import { EjsContext } from './context.js'

export class EjsInstance {
    #cache
    #context
    #compiler
    #template
    #config = {}
    #methods = {}
    static exports = [
        'configure',
        'create',
        'createContext',
        'render',
        'require',
        'preload',
        'compile',
        'helpers',
    ]
    constructor(options = {}) {
        bindContext(this, this.constructor.exports)
        this.#methods = {}
        this.#config = configSchema({}, options)
        this.#context = new EjsContext(this.#config, this.#methods)
        this.#compiler = new EjsCompiler(this.#config)
        this.#cache = new EjsCache(this.#config)
        this.#template = new EjsTemplate(
            this.#config,
            this.#cache,
            this.#compiler,
        )
        this.helpers({ render: this.render, require: this.require })
    }
    create(options) {
        return new this.constructor(options)
    }
    configure(options) {
        if (options) {
            configSchema(this.#config, options)
            this.#context.configure(this.#config, this.#methods)
            this.#compiler.configure(this.#config)
            this.#cache.configure(this.#config)
            this.#template.configure(this.#config)
        }
        return this.#config
    }
    createContext(data) {
        return this.#context.create(data)
    }
    preload(list) {
        return this.#cache.load(list || {})
    }
    compile(content, path) {
        return this.#compiler.compile(content, path)
    }
    helpers(methods) {
        this.#context.helpers(Object.assign(this.#methods, methods))
    }
    async render(name, params) {
        const data = this.createContext(params)
        return this.#output(this.#path(name), data).then(
            this.#outputContent(name, data),
        )
    }
    async require(name) {
        const data = this.createContext({})
        return this.#output(this.#path(name), data).then(() => data.getMacro())
    }
    #path(name) {
        const ext = name.split('.').pop()
        if (ext !== this.#config.extension) {
            name = [name, this.#config.extension].join('.')
        }
        return name
    }
    #output(path, data) {
        return this.#template
            .get(path)
            .then((callback) =>
                callback.apply(data, [
                    data,
                    data.useComponent(),
                    data.useElement(),
                    data.useBuffer(),
                    data.useEscapeValue(),
                ]),
            )
    }
    #renderLayout(name, params, parentTemplate) {
        const data = this.createContext(params)
        if (parentTemplate) data.setParentTemplate(parentTemplate)
        return this.#output(this.#path(name), data).then(
            this.#outputContent(name, data),
        )
    }
    #outputContent(name, data) {
        return (content) => {
            if (data.getExtend()) {
                data.setExtend(false)
                return this.#renderLayout(data.getLayout(), data, name)
            }
            return content
        }
    }
}
