const regexpObject = (obj) => {
    return new RegExp(['[', Object.keys(obj).join(''), ']'].join(''), 'g')
}

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

const symbolEntitiesRegexp = regexpObject(symbolEntities)
const htmlEntitiesRegexp = regexpObject(htmlEntities)

const entities = (string) => {
    return ('' + string).replace(htmlEntitiesRegexp, function (match) {
        return htmlEntities[match]
    })
}

const symbols = (string) => {
    return ('' + string).replace(symbolEntitiesRegexp, function (match) {
        return '\\' + symbolEntities[match]
    })
}

const safeValue = (value, escape, check) => {
    return (check = value) == null ? '' : escape ? entities(check) : check
}

const getPath = (context, name) => {
    let data = context
    let chunk = name.split('.')
    let prop = chunk.pop()
    chunk.forEach((part) => {
        data = data[part] = data[part] || {}
    })
    return [data, prop]
}

const extend = (target, ...sources) => {
    return Object.assign(target, ...sources.filter((i) => i))
}

const uuid = (str) => {
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

const random = (size) => {
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

const hasProp = (object, prop) => object.hasOwnProperty(prop)

export { uuid, extend, random, hasProp, getPath, entities, symbols, safeValue }
