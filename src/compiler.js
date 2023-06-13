import { symbols } from './utils'

const trunc = (value) => {
    return value.replace(/^(?:\r\n|\r|\n)/, '')
}

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

const matchTokens = (regex, text, callback) => {
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

export class Compiler {
    constructor(config) {
        this.configure(config)
    }
    configure(config) {
        this.withObject = config.withObject
        this.rmWhitespace = config.rmWhitespace
        this.token = config.token
        this.vars = config.vars
        this.matches = []
        this.formats = []
        this.slurp = {
            match: '[ \\t]*',
            start: [this.token.start, '_'],
            end: ['_', this.token.end],
        }
        tagList.forEach((item) => {
            this.matches.push(
                this.token.start
                    .concat(item.symbol)
                    .concat(this.token.regex)
                    .concat(this.token.end)
            )
            this.formats.push(item.format.bind(this.vars))
        })
        this.regex = new RegExp(this.matches.join('|').concat('|$'), 'g')
        this.slurpStart = new RegExp(
            [this.slurp.match, this.slurp.start.join('')].join(''),
            'gm'
        )
        this.slurpEnd = new RegExp(
            [this.slurp.end.join(''), this.slurp.match].join(''),
            'gm'
        )
    }
    truncate(value) {
        return value && value.replace(/^(?:\r\n|\r|\n)/, '')
    }
    compile(content, path) {
        const { SCOPE, SAFE, BUFFER } = this.vars
        if (this.rmWhitespace) {
            content = content
                .replace(/[\r\n]+/g, '\n')
                .replace(/^\s+|\s+$/gm, '')
        }
        content = content
            .replace(this.slurpStart, this.token.start)
            .replace(this.slurpEnd, this.token.end)
        let source = `${BUFFER}('`
        matchTokens(this.regex, content, (params, index, offset) => {
            source += symbols(content.slice(index, offset))
            params.forEach((value, index) => {
                if (value) {
                    source += this.formats[index](value)
                }
            })
        })
        source += `');`
        source = `try{${source}}catch(e){console.info(e)}`
        if (this.withObject) {
            source = `with(${SCOPE}){${source}}`
        }
        source = `${BUFFER}.start();${source}return ${BUFFER}.end();`
        source += `\n//# sourceURL=${path}`
        let result = null
        try {
            result = new Function(SCOPE, BUFFER, SAFE, source)
            result.source = `(function(${SCOPE},${BUFFER},${SAFE}){\n${source}\n})`
        } catch (e) {
            e.filename = path
            e.source = source
            throw e
        }
        return result
    }
}
