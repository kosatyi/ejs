import { isFunction, isObject, isUndefined } from './type'

const isNodeEnv =
    Object.prototype.toString.call(
        typeof process !== 'undefined' ? process : 0
    ) === '[object process]'

export const isNode = () => isNodeEnv

export const symbolEntities = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029',
}

export const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
}

const regexKeys = (obj) =>
    new RegExp(['[', Object.keys(obj).join(''), ']'].join(''), 'g')

export const htmlEntitiesMatch = regexKeys(htmlEntities)

export const symbolEntitiesMatch = regexKeys(symbolEntities)

export const entities = (string = '') => {
    return ('' + string).replace(
        htmlEntitiesMatch,
        (match) => htmlEntities[match]
    )
}

export const symbols = (string) => {
    return ('' + string).replace(
        symbolEntitiesMatch,
        (match) => '\\' + symbolEntities[match]
    )
}

export const safeValue = (value, escape, check) => {
    return (check = value) == null ? '' : escape ? entities(check) : check
}

const BreakException = {}

export const getPath = (context, name, create) => {
    let data = context
    let chunk = name.split('.')
    let prop = chunk.pop()
    try {
        chunk.forEach((part) => {
            if (isObject(data[part])) {
                data = data[part]
            } else if (create === true) {
                data = data[part] = {}
            } else {
                throw BreakException
            }
        })
    } catch (e) {
        if (e !== BreakException) throw e
    }
    return [data, prop]
}

export const bindContext = (object, context, methods = []) => {
    methods.forEach((name) => {
        if (name in object) {
            object[name] = object[name].bind(context)
        }
    })
}

export const isPromise = (p) => {
    return Boolean(p && isFunction(p.then))
}

export const ext = (path, defaults) => {
    const ext = path.split('.').pop()
    if (ext !== defaults) {
        path = [path, defaults].join('.')
    }
    return path
}

export const extend = (...args) => {
    const target = args.shift()
    return args
        .filter((source) => source)
        .reduce((target, source) => {
            return Object.assign(target, source)
        }, target)
}

export const noop = () => {}

export const format = (pattern, params) => {
    pattern = pattern || ''
    params = params || {}
    return pattern.replace(/\${(.+?)}/g, function (match, prop) {
        return hasProp(params, prop) ? params[prop] : match
    })
}

export const each = (object, callback) => {
    let prop
    for (prop in object) {
        if (hasProp(object, prop)) {
            callback(object[prop], prop, object)
        }
    }
}

export const map = (object, callback, context) => {
    const result = []
    each(
        object,
        (value, key, object) => {
            let item = callback(value, key, object)
            if (isUndefined(item) === false) {
                result.push(item)
            }
        },
        context
    )
    return result
}

export const filter = (object, callback, context) => {
    const isArray = object instanceof Array
    const result = isArray ? [] : {}
    each(
        object,
        (value, key, object) => {
            let item = callback(value, key, object)
            if (isUndefined(item) === false) {
                if (isArray) {
                    result.push(item)
                } else {
                    result[key] = item
                }
            }
        },
        context
    )
    return result
}

export const omit = (object, list) => {
    return filter(object, (value, key) => {
        if (list.indexOf(key) === -1) {
            return value
        }
    })
}

export const uuid = (str) => {
    let i = str.length
    let hash1 = 5381
    let hash2 = 52711
    while (i--) {
        const char = str.charCodeAt(i)
        hash1 = (hash1 * 33) ^ char
        hash2 = (hash2 * 33) ^ char
    }
    return (hash1 >>> 0) * 4096 + (hash2 >>> 0)
}

export const resolve = (value, callback, context) =>
    Promise.resolve(value).then(callback.bind(context))

export const defineProp = (obj, key, descriptor) =>
    Object.defineProperty(obj, key, descriptor)

export const random = (size) => {
    let string = ''
    let chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_'
    let limit = chars.length
    let length = size || 10
    for (let i = 0; i < length; i++) {
        string += chars.charAt(Math.floor(Math.random() * limit))
    }
    return string
}

export const hasProp = (object, prop) => {
    return object && object.hasOwnProperty(prop)
}
