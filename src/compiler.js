import { symbols, matchTokens } from './utils.js'

export class Compiler {
    #config = {}
    #symbols = [
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
    constructor(config) {
        this.configure(config)
    }
    configure(config) {
        this.#config.withObject = config.withObject
        this.#config.rmWhitespace = config.rmWhitespace
        this.#config.token = config.token
        this.#config.vars = config.vars
        this.#config.globalHelpers = config.globalHelpers
        this.#config.matches = []
        this.#config.formats = []
        this.#config.slurp = {
            match: '[s\t\n]*',
            start: [this.#config.token.start, '_'],
            end: ['_', this.#config.token.end],
        }
        this.#symbols.forEach((item) => {
            this.#config.matches.push(
                this.#config.token.start
                    .concat(item.symbol)
                    .concat(this.#config.token.regex)
                    .concat(this.#config.token.end)
            )
            this.#config.formats.push(item.format.bind(this.#config.vars))
        })
        this.#config.regex = new RegExp(
            this.#config.matches.join('|').concat('|$'),
            'g'
        )
        this.#config.slurpStart = new RegExp(
            [this.#config.slurp.match, this.#config.slurp.start.join('')].join(
                ''
            ),
            'gm'
        )
        this.#config.slurpEnd = new RegExp(
            [this.#config.slurp.end.join(''), this.#config.slurp.match].join(
                ''
            ),
            'gm'
        )
    }
    compile(content, path) {
        const { SCOPE, SAFE, BUFFER, COMPONENT, ELEMENT } = this.#config.vars
        const GLOBALS = this.#config.globalHelpers
        if (this.#config.rmWhitespace) {
            content = String(content)
                .replace(/[\r\n]+/g, '\n')
                .replace(/^\s+|\s+$/gm, '')
        }
        content = String(content)
            .replace(this.#config.slurpStart, this.#config.token.start)
            .replace(this.#config.slurpEnd, this.#config.token.end)
        let source = `${BUFFER}('`
        matchTokens(this.#config.regex, content, (params, index, offset) => {
            source += symbols(content.slice(index, offset))
            params.forEach((value, index) => {
                if (value) {
                    source += this.#config.formats[index](value)
                }
            })
        })
        source += `');`
        source = `try{${source}}catch(e){return ${BUFFER}.error(e)}`
        if (this.#config.withObject) {
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
}
