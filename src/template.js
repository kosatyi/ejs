import { isFunction } from './type.js'
import { assertInstanceOf } from './utils.js'

import { Cache } from './cache.js'
import { Compiler } from './compiler.js'

export class Template {
    #path
    #cache
    #compiler
    #resolver
    constructor(config, cache, compiler) {
        assertInstanceOf(cache, Cache)
        assertInstanceOf(compiler, Compiler)
        this.#cache = cache
        this.#compiler = compiler
        this.configure(config)
    }
    #resolve(path) {
        return this.#resolver(this.#path, path)
    }
    #result(template, content) {
        this.#cache.set(template, content)
        return content
    }
    #compile(content, template) {
        if (isFunction(content)) {
            return content
        } else {
            return this.#compiler.compile(content, template)
        }
    }
    configure(config) {
        this.#path = config.path
        if (isFunction(config.resolver)) {
            this.#resolver = config.resolver
        }
    }
    get(template) {
        if (this.#cache.exist(template)) {
            return this.#cache.resolve(template)
        }
        return this.#resolve(template).then((content) =>
            this.#result(template, this.#compile(content, template))
        )
    }
}
