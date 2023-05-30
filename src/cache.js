import { extend, hasProp, isNode } from './utils'

const global = typeof globalThis !== 'undefined' ? globalThis : window || self

function configureCache(config) {
    const namespace = config.export
    const list = {}
    const cache = {
        preload() {
            if (isNode() === false) {
                this.load(global[namespace])
            }
            return this
        },
        exist(key) {
            return hasProp(list, key)
        },
        get(key) {
            return list[key]
        },
        remove(key) {
            delete list[key]
        },
        resolve(key) {
            return Promise.resolve(this.get(key))
        },
        set(key, value) {
            list[key] = value
            return this
        },
        load(data) {
            extend(list, data)
            return this
        },
    }
    return cache.preload()
}

export default configureCache
