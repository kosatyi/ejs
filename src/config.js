import { getPath, extend, hasProp } from './utils'
import { CONFIG } from './defaults'

const store = {}

extend(store, CONFIG)

const config = {
    /**
     *
     * @param name
     * @param defaults
     * @return {*}
     */
    get(name, defaults) {
        const [result, prop] = getPath(store, name)
        return hasProp(result, prop) ? result[prop] : defaults
    },
    /**
     *
     * @param name
     * @param value
     * @return {config}
     */
    set(name, value) {
        const [result, prop] = getPath(store, name)
        result[prop] = value
        return this
    },
}

export { config }
