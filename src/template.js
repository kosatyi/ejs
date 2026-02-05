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
        const cached = this.#cache.get(template)
        if (cached instanceof Promise) return cached
        const result = Promise.resolve(
            this.#resolver(this.#path, template, error),
        )
        this.#cache.set(template, result)
        return result
    }
    #compile(content, template) {
        const cached = this.#cache.get(template)
        if (typeof cached === 'function') return cached
        if (typeof content === 'string') {
            content = this.#compiler.compile(content, template)
        }
        if (typeof content === 'function') {
            this.#cache.set(template, content)
            return content
        }
    }
    get(template) {
        return this.#resolve(template).then((content) => {
            return this.#compile(content, template)
        })
    }
}
