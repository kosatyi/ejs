const jsVariableName = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/

export const typeProp = function () {
    const args = [].slice.call(arguments)
    const callback = args.shift()
    return args.filter(callback).pop()
}
export const isArray = (value) => Array.isArray(value)
export const isFunction = (value) => typeof value === 'function'
export const isString = (value) => typeof value === 'string'
export const isBoolean = (value) => typeof value === 'boolean'
export const isUndefined = (value) => typeof value === 'undefined'
export const isArrayOfVariables = (value) => {
    if (!isArray(value)) return false
    return value.filter((name) => {
        const valid = jsVariableName.test(name)
        if (valid === false)
            console.log(
                `ejsConfig.globals: expected '${name}' to be valid variable name --> skipped`,
            )
        return valid
    })
}
