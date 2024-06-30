import { extend, hasProp, instanceOf, isNode } from './utils'

const global = typeof globalThis !== 'undefined' ? globalThis : window || self

export function Cache(config) {
    if (instanceOf(this, Cache) === false) return new Cache(config)
    const cache = {
        enabled: true,
        list: {},
    }
    this.configure = function (config) {
        cache.list = {}
        cache.enabled = config.cache
        if (isNode() === false) {
            this.load(global[config.export])
        }
    }
    this.load = function (data) {
        if (cache.enabled) {
            extend(cache.list, data || {})
        }
        return this
    }
    this.get = function (key) {
        if (cache.enabled) {
            return cache.list[key]
        }
    }
    this.set = function (key, value) {
        if (cache.enabled) {
            cache.list[key] = value
        }
        return this
    }
    this.resolve = function (key) {
        return Promise.resolve(this.get(key))
    }
    this.remove = function (key) {
        delete cache.list[key]
    }
    this.exist = function (key) {
        return hasProp(cache.list, key)
    }
}
