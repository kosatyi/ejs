import { instanceOf, symbols } from './utils'

const tagList = [
    {
        symbol: '-',
        format(value) {
            return `')\n${this.BUFFER}(${this.SAFE}(${value},1))\n${this.BUFFER}('`
        },
    },
    {
        symbol: '=',
        format(value) {
            return `')\n${this.BUFFER}(${this.SAFE}(${value}))\n${this.BUFFER}('`
        },
    },
    {
        symbol: '#',
        format(value) {
            return `')\n/**${value}**/\n${this.BUFFER}('`
        },
    },
    {
        symbol: '',
        format(value) {
            return `')\n${value.trim()}\n${this.BUFFER}('`
        },
    },
]

function matchTokens(regex, text, callback) {
    let index = 0
    text.replace(regex, function () {
        const params = [].slice.call(arguments, 0, -1)
        const offset = params.pop()
        const match = params.shift()
        callback(params, index, offset)
        index = offset + match.length
        return match
    })
}

export function Compiler(config) {
    if (instanceOf(this, Compiler) === false) return new Compiler(config)

    const compiler = {}

    this.configure = function (config) {
        compiler.withObject = config.withObject
        compiler.rmWhitespace = config.rmWhitespace
        compiler.token = config.token
        compiler.vars = config.vars
        compiler.matches = []
        compiler.formats = []
        compiler.slurp = {
            match: '[ \\t]*',
            start: [compiler.token.start, '_'],
            end: ['_', compiler.token.end],
        }
        tagList.forEach((item) => {
            compiler.matches.push(
                compiler.token.start
                    .concat(item.symbol)
                    .concat(compiler.token.regex)
                    .concat(compiler.token.end)
            )
            compiler.formats.push(item.format.bind(compiler.vars))
        })
        compiler.regex = new RegExp(
            compiler.matches.join('|').concat('|$'),
            'g'
        )
        compiler.slurpStart = new RegExp(
            [compiler.slurp.match, compiler.slurp.start.join('')].join(''),
            'gm'
        )
        compiler.slurpEnd = new RegExp(
            [compiler.slurp.end.join(''), compiler.slurp.match].join(''),
            'gm'
        )
    }

    function truncate(value) {
        return value && value.replace(/^(?:\r\n|\r|\n)/, '')
    }

    this.compile = function (content, path) {
        const { SCOPE, SAFE, BUFFER, COMPONENT } = compiler.vars
        if (compiler.rmWhitespace) {
            content = content
                .replace(/[\r\n]+/g, '\n')
                .replace(/^\s+|\s+$/gm, '')
        }
        content = content
            .replace(compiler.slurpStart, compiler.token.start)
            .replace(compiler.slurpEnd, compiler.token.end)
        let source = `${BUFFER}('`
        matchTokens(compiler.regex, content, (params, index, offset) => {
            source += symbols(content.slice(index, offset))
            params.forEach((value, index) => {
                if (value) {
                    source += compiler.formats[index](value)
                }
            })
        })
        source += `');`
        source = `try{${source}}catch(e){console.info(e)}`
        if (compiler.withObject) {
            source = `with(${SCOPE}){${source}}`
        }
        source = `${BUFFER}.start();${source}return ${BUFFER}.end();`
        source += `\n//# sourceURL=${path}`
        let result = null
        try {
            result = new Function(SCOPE, COMPONENT, BUFFER, SAFE, source)
            result.source = `(function(${SCOPE},${COMPONENT},${BUFFER},${SAFE}){\n${source}\n})`
        } catch (e) {
            e.filename = path
            e.source = source
            throw e
        }
        return result
    }

    this.configure(config)
}
