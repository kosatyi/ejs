import { hasProp, isNode } from './utils.js'

const global = typeof globalThis !== 'undefined' ? globalThis : window || self
/**
 *
 * @param {EjsConfig} options
 */
export const Cache = (options = {}) => {
    const config = {}
    const list = {}
    const load = (data) => {
        if (config.enabled) {
            Object.assign(list, data || {})
        }
    }
    const get = (key) => {
        if (config.enabled) {
            return list[key]
        }
    }
    const set = (key, value) => {
        if (config.enabled) {
            list[key] = value
        }
    }
    const exist = (key) => {
        if (config.enabled) {
            return hasProp(list, key)
        }
    }
    const clear = () => {
        Object.keys(list).forEach(remove)
    }
    const remove = (key) => {
        delete list[key]
    }
    const resolve = (key) => {
        return Promise.resolve(get(key))
    }
    const configure = (options = {}) => {
        config.enabled = options.cache
        config.precompiled = options.precompiled
        if (isNode() === false) {
            load(global[config.precompiled])
        }
    }
    configure(options)
    return {
        configure,
        load,
        set,
        get,
        exist,
        clear,
        remove,
        resolve,
    }
}
