const { extend, hasProp } = require('./utils')

function Cache(config) {
    this.namespace = config.export
    this.list = {}
    this.preload()
}

Cache.prototype = {
    exist(key) {
        return hasProp(this.list, key)
    },
    get(key) {
        return this.list[key]
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
