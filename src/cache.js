import { extend, hasProp, isNode } from './utils'

function Cache(config) {
    this.list = {}
    this.enabled = config.cache || false
    this.namespace = config.export
    this.preload()
}

Cache.prototype = {
    exist(key) {
        return hasProp(this.list, key)
    },
    get(key) {
        return this.list[key]
    },
    remove(key) {
        delete this.list[key]
    },
    resolve(key) {
        return Promise.resolve(this.get(key))
    },
    set(key, value) {
        this.list[key] = value
    },
    preload() {
        if (isNode() === false) {
            extend(this.list, window[this.namespace])
        }
    },
    load(list) {
        extend(this.list, list)
    },
}

export default Cache
