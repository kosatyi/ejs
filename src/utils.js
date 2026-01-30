import { isFunction, isUndefined } from './type.js'

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
        (match) => htmlEntities[match],
    )
}

export const symbols = (string) => {
    return ('' + string).replace(
        symbolEntitiesMatch,
        (match) => '\\' + symbolEntities[match],
    )
}

export const safeValue = (value, escape) => {
    const check = value
    return check == null
        ? ''
        : Boolean(escape) === true
          ? entities(check)
          : check
}

export const instanceOf = (object, instance) => {
    return Boolean(object instanceof instance)
}

export const getPath = (context, name, strict) => {
    let data = context
    let chunks = String(name).split('.')
    let prop = chunks.pop()
    for (let i = 0; i < chunks.length; i++) {
        const part = chunks[i]
        if (isFunction(data['toJSON'])) {
            data = data.toJSON()
        }
        if (strict && data.hasOwnProperty(part) === false) {
            data = {}
            break
        }
        data = data[part] = data[part] || {}
    }
    if (isFunction(data['toJSON'])) {
        data = data.toJSON()
    }
    return [data, prop]
}

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
        context,
    )
    return result
}

export const omit = (object, list) => {
    const result = { ...object }
    for (const key of list) {
        delete result[key]
    }
    return result
}

export const hasProp = (object, prop) => {
    return object && Object.hasOwn(object, prop)
}

export const joinPath = (path, template) => {
    template = [path, template].join('/')
    template = template.replace(/\/\//g, '/')
    return template
}

export const bindContext = (object, methods = []) => {
    for (let i = 0, len = methods.length; i < len; i++) {
        const name = methods[i]
        if (name in object) {
            object[name] = object[name].bind(object)
        }
    }
}
