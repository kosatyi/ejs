const { symbols } = require('./utils')

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

function Compiler(token, vars, extension) {
    this.extension = extension
    this.token = token
    this.vars = vars
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
        let extension = path.split('.').pop()
        if (extension === this.extension.module) {
            content = [this.token.start, content, this.token.end].join('\n')
        }
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
        try {
            result = new Function(SCOPE, SAFE, BUFFER, source)
            result.source = `(function(${SCOPE},${SAFE},${BUFFER}){\n${source}\n})`
        } catch (e) {
            e.filename = path
            e.source = source
            throw e
        }
        return result
    },
}

module.exports = Compiler
