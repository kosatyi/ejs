import { symbols } from './utils'

const config = {
    escape: /<%-([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    evaluate: /<%([\s\S]+?)%>/g,
}

const noMatch = /(.)^/

const matcher = new RegExp(
    [
        (config.escape || noMatch).source,
        (config.interpolate || noMatch).source,
        (config.evaluate || noMatch).source,
    ].join('|') + '|$',
    'g'
)

const compile = (text, path) => {
    let result = null
    let ext = path.split('.').pop()
    let index = 0
    if (ext === 'mjs') {
        text = ['<%', text, '%>'].join('\n')
    }
    let source = "$$i+='"
    text.replace(
        matcher,
        function (match, escape, interpolate, evaluate, offset) {
            source += symbols(text.slice(index, offset))
            if (escape) {
                source += "'+\n$$v(" + escape + ",1)+\n'"
            }
            if (interpolate) {
                source += "'+\n$$v(" + interpolate + ")+\n'"
            }
            if (evaluate) {
                source += "'\n" + evaluate + "\n$$i+='"
            }
            index = offset + match.length
            return match
        }
    )
    source += "';\n"
    source = 'with(o||{}){\n' + source + '}\n'
    source =
        "var $$i=''\n" +
        "function $$m(c,t,b){return function(){t=$$i+'';$$i='';c.apply(null,arguments);b=$$i+'';$$i=t;return b} }\n" +
        "function $$j(){$$i+=[].join.call(arguments,'')}\n" +
        'this.$$m = $$m;\n' +
        'this.$$j = $$j;\n' +
        source +
        'return $$i;\n'
    try {
        result = new Function('o', '$$v', source)
        result.source = '(function(o,$$v){\n' + source + '\n})'
    } catch (e) {
        e.filename = path
        e.source = source
        throw e
    }
    return result
}

const wrapper = (name, list) => {
    let out = '(function(o){\n'
    list.forEach((item) => {
        out +=
            'o[' +
            JSON.stringify(item.name) +
            ']=' +
            String(item.content) +
            '\n'
    })
    out += '})(window.' + name + ' = window.' + name + ' || {});\n'
    return out
}

export { compile, wrapper }
