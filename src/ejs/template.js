import { isFunction } from './type.js'
import { bindContext } from './utils.js'
import { error } from './error.js'

export class EjsTemplate {
    #path
    #resolver
    #cache
    #compiler
    static exports = ['configure', 'get']

    constructor(options, cache, compiler) {
        bindContext(this, this.constructor.exports)
        this.#cache = cache
        this.#compiler = compiler
        this.configure(options ?? {})
    }

    configure(options) {
        this.#path = options.path
        if (isFunction(options.resolver)) {
            this.#resolver = options.resolver
        }
    }
    #resolve(template) {
        return Promise.resolve(this.#resolver(this.#path, template, error))
    }
    #compile(content, template) {
        if (typeof content === 'function') {
            return content
        }
        if (typeof content === 'string') {
            return this.#compiler.compile(content, template)
        }
    }
    get(template) {
        const callback = this.#cache.get(template)
        if (callback) return Promise.resolve(callback)
        return this.#resolve(template).then((content) => {
            const callback = this.#compile(content, template)
            this.#cache.set(template, callback)
            return callback
        })
    }
}
