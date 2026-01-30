import { isFunction } from './type.js'
import { bindContext } from './utils.js'

export class Template {
    #path
    #resolver
    #cache
    #compiler
    static exports = ['configure', 'get', 'compile']
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
    #resolve(path) {
        if (this.#cache.get(path)) return this.#cache.get(path)
        const result = Promise.resolve(this.#resolver(this.#path, path))
        this.#cache.set(path, result)
        return result
    }
    compile(content, template) {
        if (typeof content === 'function') {
            return content
        } else {
            return this.#compiler.compile(content, template)
        }
    }
    get(template) {
        return this.#resolve(template).then((content) =>
            this.compile(content, template),
        )
    }
}
