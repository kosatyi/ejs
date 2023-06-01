export class Bundler {
    constructor(config) {
        this.configure(config)
    }
    configure(config) {
        this.namespace = config.export
        this.useStrict = config.withObject === false
    }
    wrapper(list) {
        let out = ''
        out += '(function(global,factory){'
        out += 'typeof exports === "object" && typeof module !== "undefined" ?'
        out += 'module.exports = factory():'
        out += 'typeof define === "function" && define.amd ? define(factory):'
        out += '(global = typeof globalThis !== "undefined" ? globalThis:'
        out += 'global || self,global["' + this.namespace + '"] = factory())'
        out += '})(this,(function(){'
        if (this.useStrict) out += "'use strict';\n"
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
