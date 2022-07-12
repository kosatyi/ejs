const symbolEntities = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029',
}

const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
}

function regexKeys(obj) {
    return new RegExp(['[', Object.keys(obj).join(''), ']'].join(''), 'g')
}

const htmlEntitiesMatch = regexKeys(htmlEntities)
const symbolEntitiesMatch = regexKeys(symbolEntities)

export const entities = function (string = '') {
    return ('' + string).replace(
        htmlEntitiesMatch,
        (match) => htmlEntities[match]
    )
}

export const symbols = function (string) {
    return ('' + string).replace(
        symbolEntitiesMatch,
        (match) => '\\' + symbolEntities[match]
    )
}

export const safeValue = function (value, escape, check) {
    return (check = value) == null ? '' : escape ? entities(check) : check
}

export const getPath = function (context, name) {
    let data = context
    let chunk = name.split('.')
    let prop = chunk.pop()
    chunk.forEach(function (part) {
        data = data[part] = data[part] || {}
    })
    return [data, prop]
}

export const assign = function (list) {
    const sources = (list || [null]).map(function (source) {
        return source || {}
    })
    return {
        target: sources.shift(),
        sources,
    }
}

export const isPromise = function (p) {
    return Boolean(p && typeof p.then === 'function')
}

export const merge = function (target) {
    return [].slice
        .call(arguments, 1)
        .filter(function (source) {
            return source
        })
        .reduce(function (target, source) {
            return Object.assign(target, source)
        }, target)
}

export const extend = function (target) {
    return [].slice
        .call(arguments, 1)
        .filter(function (source) {
            return source
        })
        .reduce(function (target, source) {
            return Object.assign(target, source)
        }, target)
}

export const noop = function () {}

export const format = function (pattern, params) {
    pattern = pattern || ''
    params = params || {}
    return pattern.replace(/\${(.+?)}/g, function (match, prop) {
        return hasProp(params, prop) ? params[prop] : match
    })
}

export const each = function (object, callback, context) {
    let prop
    for (prop in object) {
        if (hasProp(object, prop)) {
            callback.call(context || null, object[prop], prop, object)
        }
    }
}

export const isNode = new Function(
    'try {return this===global;}catch(e){return false;}'
)

export const map = function (object, callback, context) {
    const result = []
    each(
        object,
        function (value, key, object) {
            let item = callback.call(this, value, key, object)
            if (item !== undefined) {
                result.push(item)
            }
        },
        context
    )
    return result
}

export const filter = function (object, callback, context) {
    const isArray = object instanceof Array
    const result = isArray ? [] : {}
    each(
        object,
        function (value, key, object) {
            let item = callback.call(this, value, key, object)
            if (item !== undefined) {
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

export const omit = function (object, list) {
    return filter(object, function (value, key) {
        if (list.indexOf(key) === -1) {
            return value
        }
    })
}

export const uuid = function (str) {
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

export const random = function (size) {
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

export const hasProp = function (object, prop) {
    return object && object.hasOwnProperty(prop)
}
