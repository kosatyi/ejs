import { extend, hasProp, isNode } from './utils'

const global = typeof globalThis !== 'undefined' ? globalThis : window || self

export class Cache {
    list = {}
    constructor(config) {
        this.configure(config)
        if (isNode() === false) {
            this.load(global[this.namespace])
        }
    }
    configure(config) {
        this.list = {}
        this.namespace = config.export
    }
    load(data) {
        extend(this.list, data)
        return this
    }
    exist(key) {
        return hasProp(this.list, key)
    }
    get(key) {
        return this.list[key]
    }
    remove(key) {
        delete this.list[key]
    }
    resolve(key) {
        return Promise.resolve(this.get(key))
    }
    set(key, value) {
        this.list[key] = value
        return this
    }
}
