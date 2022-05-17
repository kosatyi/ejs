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

const reKeys = (obj) => {
    return new RegExp(['[', Object.keys(obj).join(''), ']'].join(''), 'g')
}

export const entities = (string = '') => {
    return string.replace(reKeys(htmlEntities), (match) => htmlEntities[match])
}

export const symbols = (string) => {
    return ('' + string).replace(
        reKeys(symbolEntities),
        (match) => '\\' + symbolEntities[match]
    )
}

export const safeValue = (value, escape, check) => {
    return (check = value) == null ? '' : escape ? entities(check) : check
}

export const getPath = (context, name) => {
    let data = context
    let chunk = name.split('.')
    let prop = chunk.pop()
    chunk.forEach((part) => {
        data = data[part] = data[part] || {}
    })
    return [data, prop]
}

export const extend = (target, ...sources) => {
    return Object.assign(target, ...sources.filter((i) => i))
}

export const format = (pattern = '', params = {}) => {
    return pattern.replace(/{(.+?)}/g, (match, prop) => {
        return hasProp(params, prop) ? params[prop] : match
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

export const hasProp = (object, prop) => object.hasOwnProperty(prop)
