const { symbols, each } = require('./utils')

function generate(token, tags, vars) {
    const matches = []
    const formats = []
    each(tags, function (value, name) {
        matches.push(
            token.start.concat(name).concat(token.match).concat(token.end)
        )
        formats.push(value.bind(vars))
    })
    const regex = new RegExp(matches.join('|').concat('|$'), 'g')
    return [regex, formats, matches]
}

function configure(token, tags, vars) {
    const { MACROS, OUTPUT, PRINT, SCOPE, SAFE } = vars
    const [regex, formats] = generate(token, tags, vars)
    function Compiler(text, path) {
        let index = 0
        let result = null
        let source = `${OUTPUT}+='`
        text.replace(regex, function () {
            const params = [].slice.call(arguments, 0, -1)
            const offset = params.pop()
            const match = params.shift()
            source += symbols(text.slice(index, offset))
            params.forEach((v, i) => {
                if (v) source += formats[i](v)
            })
            index = offset + match.length
            return match
        })
        source += "';\n"
        source = `with(${SCOPE}){\n${source}}\n`
        source =
            `var ${OUTPUT}=''\n` +
            `function ${MACROS}(c){return function(){var a,b=${OUTPUT};${OUTPUT}="";c.apply(null,arguments);a=${OUTPUT};${OUTPUT}=b;return a}}\n` +
            `function ${PRINT}(){${OUTPUT}+=[].join.call(arguments,'')}\n` +
            `this.$$m = ${MACROS};\n` +
            `this.$$j = ${PRINT};\n` +
            `${source}\n return ${OUTPUT};\n`
        try {
            result = new Function(SCOPE, SAFE, source)
            result.source = `(function(${SCOPE},${SAFE}){\n${source}\n})`
        } catch (e) {
            e.filename = path
            e.source = source
            throw e
        }
        return result
    }
    return Compiler
}

module.exports = configure
