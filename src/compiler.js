import { symbols, matchTokens } from './utils.js'

const configSymbols = [
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

export const Compiler = (options) => {
    const config = {}
    const configure = (options) => {
        config.withObject = options.withObject
        config.rmWhitespace = options.rmWhitespace
        config.token = options.token
        config.vars = options.vars
        config.globals = Object.keys(options.globals)
        config.matches = []
        config.formats = []
        config.slurp = {
            match: '[s\t\n]*',
            start: [config.token.start, '_'],
            end: ['_', config.token.end],
        }
        configSymbols.forEach((item) => {
            config.matches.push(
                config.token.start
                    .concat(item.symbol)
                    .concat(config.token.regex)
                    .concat(config.token.end),
            )
            config.formats.push(item.format.bind(config.vars))
        })
        config.regex = new RegExp(config.matches.join('|').concat('|$'), 'g')
        config.slurpStart = new RegExp(
            [config.slurp.match, config.slurp.start.join('')].join(''),
            'gm',
        )
        config.slurpEnd = new RegExp(
            [config.slurp.end.join(''), config.slurp.match].join(''),
            'gm',
        )
    }
    const compile = (content, path) => {
        const { SCOPE, SAFE, BUFFER, COMPONENT, ELEMENT } = config.vars
        const GLOBALS = config.globals
        if (config.rmWhitespace) {
            content = String(content)
                .replace(/[\r\n]+/g, '\n')
                .replace(/^\s+|\s+$/gm, '')
        }
        content = String(content)
            .replace(config.slurpStart, config.token.start)
            .replace(config.slurpEnd, config.token.end)
        let source = `${BUFFER}('`
        matchTokens(config.regex, content, (params, index, offset) => {
            source += symbols(content.slice(index, offset))
            params.forEach((value, index) => {
                if (value) {
                    source += config.formats[index](value)
                }
            })
        })
        source += `');`
        source = `try{${source}}catch(e){return ${BUFFER}.error(e)}`
        if (config.withObject) {
            source = `with(${SCOPE}){${source}}`
        }
        source = `${BUFFER}.start();${source}return ${BUFFER}.end();`
        source += `\n//# sourceURL=${path}`
        let result = null
        let params = [SCOPE, COMPONENT, ELEMENT, BUFFER, SAFE].concat(GLOBALS)
        try {
            result = Function.apply(null, params.concat(source))
            result.source = `(function(${params.join(',')}){\n${source}\n});`
        } catch (e) {
            e.filename = path
            e.source = source
            throw e
        }
        return result
    }
    configure(options)
    return {
        configure,
        compile,
    }
}
