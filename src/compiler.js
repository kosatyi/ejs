import { bindContext, symbols } from './utils.js'

const tokenList = [
    ['-', (v, b, s) => `')\n${b}(${s}(${v},1))\n${b}('`],
    ['=', (v, b, s) => `')\n${b}(${s}(${v}))\n${b}('`],
    ['#', (v, b) => `')\n/**${v}**/\n${b}('`],
    ['', (v, b) => `')\n${v}\n${b}('`],
]

const tokensMatch = (regex, content, callback) => {
    let index = 0
    content.replace(regex, function () {
        const params = [].slice.call(arguments, 0, -1)
        const offset = params.pop()
        const match = params.shift()
        callback(params, index, offset)
        index = offset + match.length
        return match
    })
}

export class EjsTemplate extends Function {
    source = ''
}

export class Compiler {
    #config = {}
    static exports = ['compile']

    constructor(options) {
        bindContext(this, this.constructor.exports)
        this.configure(options)
    }

    configure(options) {
        this.#config.strict = options.strict
        this.#config.rmWhitespace = options.rmWhitespace
        this.#config.token = options.token
        this.#config.vars = options.vars
        this.#config.globals = options.globals
        this.#config.legacy = options.legacy ?? true
        this.#config.slurp = {
            match: '[s\t\n]*',
            start: [this.#config.token.start, '_'],
            end: ['_', this.#config.token.end],
        }
        this.#config.matches = []
        this.#config.formats = []
        for (const [symbol, format] of tokenList) {
            this.#config.matches.push(
                this.#config.token.start
                    .concat(symbol)
                    .concat(this.#config.token.regex)
                    .concat(this.#config.token.end),
            )
            this.#config.formats.push(format)
        }
        this.#config.regex = new RegExp(
            this.#config.matches.join('|').concat('|$'),
            'g',
        )
        this.#config.slurpStart = new RegExp(
            [this.#config.slurp.match, this.#config.slurp.start.join('')].join(
                '',
            ),
            'gm',
        )
        this.#config.slurpEnd = new RegExp(
            [this.#config.slurp.end.join(''), this.#config.slurp.match].join(
                '',
            ),
            'gm',
        )
        if (this.#config.globals.length) {
            if (this.#config.legacy) {
                this.#config.globalVariables = `const ${this.#config.globals
                    .map((name) => `${name}=${this.#config.vars.SCOPE}.${name}`)
                    .join(',')};`
            } else {
                this.#config.globalVariables = `const {${this.#config.globals.join(',')}} = ${this.#config.vars.SCOPE};`
            }
        }
    }
    compile(content, path) {
        const GLOBALS = this.#config.globalVariables
        const { SCOPE, SAFE, BUFFER, COMPONENT, ELEMENT } = this.#config.vars
        if (this.#config.rmWhitespace) {
            content = String(content)
                .replace(/[\r\n]+/g, '\n')
                .replace(/^\s+|\s+$/gm, '')
        }
        content = String(content)
            .replace(this.#config.slurpStart, this.#config.token.start)
            .replace(this.#config.slurpEnd, this.#config.token.end)
        let OUTPUT = `${BUFFER}('`
        tokensMatch(this.#config.regex, content, (params, index, offset) => {
            OUTPUT += symbols(content.slice(index, offset))
            params.forEach((value, index) => {
                if (value) {
                    OUTPUT += this.#config.formats[index](
                        value.trim(),
                        BUFFER,
                        SAFE,
                    )
                }
            })
        })
        OUTPUT += `');`
        OUTPUT = `try{${OUTPUT}}catch(e){return ${BUFFER}.error(e,'${path}')}`
        if (this.#config.strict === false) {
            OUTPUT = `with(${SCOPE}){${OUTPUT}}`
        }
        OUTPUT = `${BUFFER}.start();${OUTPUT}return ${BUFFER}.end();`
        OUTPUT += `\n//# sourceURL=${path}`
        if (GLOBALS) {
            OUTPUT = `${GLOBALS}\n${OUTPUT}`
        }
        try {
            const params = [SCOPE, COMPONENT, ELEMENT, BUFFER, SAFE]
            const result = Function.apply(null, params.concat(OUTPUT))
            result.source = `(function(${params.join(',')}){\n${OUTPUT}\n});`
            return result
        } catch (error) {
            error.filename = path
            error.source = OUTPUT
            throw error
        }
    }
}
