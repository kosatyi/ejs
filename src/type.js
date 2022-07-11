const type = {}

type.isFunction = function (v) {
    return typeof v === 'function'
}

type.isString = function (v) {
    return typeof v === 'string'
}

module.exports = type
