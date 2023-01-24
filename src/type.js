export const typeProp = function () {
    const args = [].slice.call(arguments)
    const callback = args.shift()
    return args.filter(callback).pop()
}
export const isFunction = (v) => typeof v === 'function'
export const isString = (v) => typeof v === 'string'
export const isBoolean = (v) => typeof v === 'boolean'
export const isUndefined = (v) => typeof v === 'undefined'
