const configureWrapper = (config) => {
    const name = config.export
    const useStrict = config.withObject !== true
    return function Wrapper(list) {
        let out = ''
        out += '(function(global,factory){'
        out += 'typeof exports === "object" && typeof module !== "undefined" ?'
        out += 'module.exports = factory():'
        out += 'typeof define === "function" && define.amd ? define(factory):'
        out += '(global = typeof globalThis !== "undefined" ? globalThis:'
        out += 'global || self,global["' + name + '"] = factory())'
        out += '})(this,(function(){'
        if (useStrict) out += "'use strict';\n"
        out += 'var list = {};\n'
        list.forEach((item) => {
            out +=
                'list[' +
                JSON.stringify(item.name) +
                ']=' +
                String(item.content) +
                ';\n'
        })
        out += 'return list;}));\n'
        return out
    }
}

export default configureWrapper
