import { configSchema } from './schema.js'
import { ext, safeValue, extend, bindContext } from './utils.js'
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
            'context',
            'preload',
            'compile',
            'helpers',
        ])
        //
        this.helpers({ require: this.#require, render: this.render })
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
    #output(path, scope) {
        const { globalHelpers } = this.#config
        const params = [
            scope,
            scope.getComponent(),
            scope.getBuffer(),
            safeValue,
        ].concat(
            globalHelpers
                .filter((name) => isFunction(scope[name]))
                .map((name) => scope[name].bind(scope))
        )
        return this.#template
            .get(path)
            .then((callback) => callback.apply(scope, params))
    }
    #require(name) {
        const filepath = ext(name, this.#config.extension)
        const scope = this.context({})
        return this.#output(filepath, scope).then(() => scope.getMacro())
    }
}

// export function EJS2(options) {
//     const self = {
//         config: {},
//         helpers: {},
//         /**
//          * @type {Context}
//          */
//         context: null,
//         /**
//          * @type {Compiler}
//          */
//         compiler: null,
//         /**
//          * @type {Template}
//          */
//         template: null,
//         /**
//          * @type {Cache}
//          */
//         cache: null,
//     }
//     /**
//      *
//      */
//     configSchema(self.config, options || {})
//     self.context = useContext(self.config, self.helpers)
//     self.compiler = useCompiler(self.config)
//     self.cache = useCache(self.config)
//     self.template = useTemplate(self.config, self.cache, self.compiler)
//     /**
//      *
//      * @param {string} path
//      * @param {ContextScope} scope
//      * @return {Promise<string>}
//      */
//     const output = (path, scope) => {
//         const { globalHelpers } = self.config
//         const params = [
//             scope,
//             scope.getComponent(),
//             scope.getBuffer(),
//             safeValue,
//         ].concat(
//             globalHelpers
//                 .filter((name) => isFunction(scope[name]))
//                 .map((name) => scope[name].bind(scope))
//         )
//         return self.template
//             .get(path)
//             .then((callback) => callback.apply(scope, params))
//     }
//     /**
//      *
//      * @param name
//      * @return {Promise<string>}
//      */
//     const require = (name) => {
//         const filepath = ext(name, self.config.extension)
//         const scope = context({})
//         return output(filepath, scope).then(() => scope.getMacro())
//     }
//     /**
//      *
//      * @param {string} name
//      * @param {{}} [data]
//      * @return {Promise<string>}
//      */
//     const render = (name, data) => {
//         const filepath = ext(name, self.config.extension)
//         const scope = context(data)
//         return output(filepath, scope).then((content) => {
//             if (scope.getExtend()) {
//                 scope.setExtend(false)
//                 const layout = scope.getLayout()
//                 const data = scope.clone()
//                 return render(layout, data)
//             }
//             return content
//         })
//     }
//     /**
//      *
//      * @param options
//      * @return {{}}
//      */
//     const configure = (options = {}) => {
//         configSchema(self.config, options || {})
//         self.context.configure(self.config, self.helpers)
//         self.compiler.configure(self.config)
//         self.cache.configure(self.config)
//         self.template.configure(self.config)
//         return self.config
//     }
//     /**
//      *
//      * @param methods
//      */
//     const helpers = (methods) => {
//         self.context.helpers(extend(self.helpers, methods))
//     }
//     /**
//      *
//      * @param list
//      * @return {*}
//      */
//     const preload = (list) => {
//         return self.cache.load(list || {})
//     }
//     /**
//      *
//      * @param options
//      * @return {any}
//      */
//     const create = (options) => {
//         return EJS(options)
//     }
//     /**
//      *
//      * @param content
//      * @param path
//      * @return {Function}
//      */
//     const compile = (content, path) => {
//         return self.compiler.compile(content, path)
//     }
//     /**
//      *
//      * @param data
//      * @return {ContextScope}
//      */
//     const context = (data = {}) => {
//         return self.context.create(data)
//     }
//     /**
//      *
//      */
//     helpers({ require, render })
//     /**
//      *
//      */
//     return {
//         configure,
//         helpers,
//         preload,
//         context,
//         compile,
//         create,
//         render,
//     }
// }
