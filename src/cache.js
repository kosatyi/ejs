const { extend, hasProp } = require('./utils')

function Cache(config) {
    this.list = {}
    this.enabled = config.cache || false
    console.log('cache is enabled', this.enabled)
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
        extend(this.list, global[this.namespace])
    },
    load(list) {
        extend(this.list, list)
    },
}

module.exports = Cache
