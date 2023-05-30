import { symbols } from './utils'

const tags = [
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

const match = (regex, text, callback) => {
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

const configureCompiler = (ejs, config) => {
    const withObject = config.withObject
    const token = config.token
    const vars = config.vars
    const matches = []
    const formats = []
    const slurp = {
        match: '[ \\t]*',
        start: [token.start, '_'],
        end: ['_', token.end],
    }
    tags.forEach((item) => {
        matches.push(
            token.start
                .concat(item.symbol)
                .concat(token.regex)
                .concat(token.end)
        )
        formats.push(item.format.bind(vars))
    })
    const regex = new RegExp(matches.join('|').concat('|$'), 'g')
    const slurpStart = new RegExp([slurp.match, slurp.start].join(''), 'gm')
    const slurpEnd = new RegExp([slurp.end, slurp.match].join(''), 'gm')
    return function compiler(content, path) {
        const { SCOPE, SAFE, BUFFER } = vars
        content = content.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '')
        content = content
            .replace(slurpStart, slurp.start)
            .replace(slurpEnd, slurp.end)
        let source = `${BUFFER}('`
        match(regex, content, (params, index, offset) => {
            source += symbols(content.slice(index, offset))
            params.forEach(function (value, index) {
                if (value) source += formats[index](value)
            })
        })
        source += `');`
        source = `try{${source}}catch(e){console.info(e)}`
        if (withObject) {
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

export default configureCompiler
