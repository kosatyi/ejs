import { bindContext } from './utils.js'

export class Cache {
    static exports = [
        'load',
        'set',
        'get',
        'exist',
        'clear',
        'remove',
        'resolve',
    ]
    #cache = true
    #precompiled
    #list = {}
    constructor(options) {
        bindContext(this, this.constructor.exports)
        this.configure(options)
    }
    get(key) {
        if (this.#cache) {
            return this.#list[key]
        }
    }
    set(key, value) {
        if (this.#cache) {
            this.#list[key] = value
        }
    }
    exist(key) {
        if (this.#cache) {
            return this.#list.hasOwnProperty(key)
        }
    }
    clear() {
        Object.keys(this.#list).forEach(this.remove)
    }
    remove(key) {
        delete this.#list[key]
    }
    resolve(key) {
        return Promise.resolve(this.get(key))
    }

    load(data) {
        if (this.#cache) {
            Object.assign(this.#list, data || {})
        }
    }

    configure(options) {
        this.#cache = options.cache
        this.#precompiled = options.precompiled
        if (typeof window === 'object') {
            this.load(window[this.#precompiled])
        }
    }
}
