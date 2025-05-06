import { bindContext, extend, hasProp, isNode } from './utils.js'

const global = typeof globalThis !== 'undefined' ? globalThis : window || self

export function useCache(config) {
    return new Cache(config)
}

export class Cache {
    #enabled = true
    #list = {}
    constructor(config) {
        bindContext(this, ['configure'])
        this.configure(config)
    }
    load(data) {
        if (this.#enabled) {
            extend(this.#list, data || {})
        }
    }
    get(key) {
        if (this.#enabled) {
            return this.#list[key]
        }
    }
    set(key, value) {
        if (this.#enabled) {
            this.#list[key] = value
        }
    }
    exist(key) {
        return hasProp(this.#list, key)
    }
    clear() {
        this.#list = {}
    }
    remove(key) {
        delete this.#list[key]
    }
    resolve(key) {
        return Promise.resolve(this.get(key))
    }
    configure(config) {
        this.#enabled = config.cache
        if (isNode() === false) {
            this.load(global[config.export])
        }
    }
}
