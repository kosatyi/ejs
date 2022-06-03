const { symbols } = require('./utils')

const getFunctionBuilder = function () {
    return Function
    let fn
    try {
        fn = new Function('return (async function(){}).constructor;')()
    } catch (e) {
        fn = Function
    }
    return fn
}

const tags = [
    {
        symbol: '-',
        format(value) {
            return `'+\n${this.SAFE}(${value},1)+\n'`
        },
    },
    {
        symbol: '=',
        format(value) {
            return `'+\n${this.SAFE}(${value})+\n'`
        },
    },
    {
        symbol: '#',
        format(value) {
            return `'+\n/**${value}**/+\n'`
        },
    },
    {
        symbol: '',
        format(value) {
            return `')\n${value}\n${this.BUFFER}('`
        },
    },
]

function Compiler(config) {
    this.extension = config.extension
    this.token = config.token
    this.vars = config.vars
    this.setup()
}

Compiler.prototype = {
    setup() {
        this.matches = []
        this.formats = []
        tags.forEach(function (item) {
            this.matches.push(
                this.token.start
                    .concat(item.symbol)
                    .concat(this.token.regex)
                    .concat(this.token.end)
            )
            this.formats.push(item.format.bind(this.vars))
        }, this)
        this.regex = new RegExp(this.matches.join('|').concat('|$'), 'g')
    },
    match(text, callback) {
        let index = 0
        callback = callback.bind(this)
        text.replace(this.regex, function () {
            const params = [].slice.call(arguments, 0, -1)
            const offset = params.pop()
            const match = params.shift()
            callback(params, index, offset)
            index = offset + match.length
            return match
        })
    },
    compile(content, path) {
        const { SCOPE, SAFE, BUFFER } = this.vars
        let result = null
        let source = `${BUFFER}('`
        this.match(content, function (params, index, offset) {
            source += symbols(content.slice(index, offset))
            params.forEach(function (value, index) {
                if (value) source += this.formats[index](value)
            }, this)
        })
        source += `');`
        source = `with(${SCOPE}){${source}}`
        source = `${BUFFER}.start();${source}return ${BUFFER}.end();`
        source += `\n//# sourceURL=${path}`
        try {
            result = new Function(SCOPE, BUFFER, SAFE, source)
            result.source = result.toString()
        } catch (e) {
            e.filename = path
            e.source = source
            throw e
        }
        return result
    },
}

module.exports = Compiler
