import { symbols } from './utils'

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

const Compiler = (config) => {
    const token = config.token
    const vars = config.vars
    const module = config.extension.module
    const matches = []
    const formats = []
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
    /**
     * @type Function
     * @name Compile
     */
    return function (content, path) {
        const { SCOPE, SAFE, BUFFER } = vars
        const extension = path.split('.').pop()
        if (extension === module) {
            content = [token.start, content, token.end].join('\n')
        }
        let source = `${BUFFER}('`
        match(regex, content, (params, index, offset) => {
            source += symbols(content.slice(index, offset))
            params.forEach(function (value, index) {
                if (value) source += formats[index](value)
            })
        })
        source += `');`
        source = `with(${SCOPE}){${source}}`
        source = `${BUFFER}.start();${source}return ${BUFFER}.end();`
        source += `\n//# sourceURL=${path}`
        let result = null
        try {
            result = new Function(SCOPE, BUFFER, SAFE, source)
            result.source = result.toString()
        } catch (e) {
            e.filename = path
            e.source = source
            throw e
        }
        return result
    }
}

export default Compiler
