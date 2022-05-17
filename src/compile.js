import { config } from './config'
import { symbols, format } from './utils'
import {
    COMMA,
    BUFFER_START,
    BUFFER_END,
    BEFORE_SAFE,
    AFTER_SAFE,
    BEFORE_LINE,
    AFTER_LINE,
    BEFORE_EVAL,
    AFTER_EVAL,
    COMMENT_START,
    COMMENT_END,
    SCOPE,
    OUTPUT,
    SAFE,
} from './defaults'

const safe = (value, escape) => {
    return (
        BEFORE_LINE +
        BEFORE_SAFE +
        value +
        COMMA +
        Boolean(escape) +
        AFTER_SAFE +
        AFTER_LINE
    )
}
const comment = (value) => {
    return BEFORE_LINE + COMMENT_START + value + COMMENT_END + AFTER_LINE
}

const evaluate = (value) => {
    return BEFORE_EVAL + value + AFTER_EVAL + BUFFER_START
}

const formatRe = (pattern = '', flags = '', params = {}) => {
    return new RegExp(format(pattern, params), flags)
}

const removeWhitespace = (text = '') => {
    return text.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '')
}

const trimSpaces = (text = '', token) => {
    return text
        .replace(
            formatRe('[ \\t]*{start}_', 'gm', token),
            format('{start}_', token)
        )
        .replace(formatRe('[ \\t]*_{end}', 'gm', token), format('_{end}'))
}

const tokenMatcher = (token = {}) => {
    return new RegExp(token.start.concat('([\\s\\S]+?)').concat(token.end), 'g')
}

const compile = (text, path) => {
    const token = config.get('token')
    let source = BUFFER_START
    let index = 0
    let ext = path.split('.').pop()
    let result = null
    if (config.get('spaceless')) {
        text = removeWhitespace(text)
    }
    text = trimSpaces(text, token)
    if (config.get('extension.module') === ext) {
        text = [token.start, text, token.end].join('\n')
    }
    text.replace(tokenMatcher(token), (match, value, offset) => {
        source += symbols(text.slice(index, offset))
        switch (value.charAt(0)) {
            case '-':
                source += safe(value.slice(1), 1)
                break
            case '=':
                source += safe(value.slice(1), 0)
                break
            case '#':
                source += comment(value.slice(1))
                break
            case '_':
            default:
                source += evaluate(value)
        }
        index = offset + match.length
        return match
    })
    source += BUFFER_END
    source = 'with(' + SCOPE + '){\n' + source + '}\n'
    source += 'return ' + OUTPUT + '.toString();\n'
    try {
        result = new Function(SCOPE, OUTPUT, SAFE, source)
        result.source =
            '(function(' +
            [SCOPE, OUTPUT, SAFE].join(',') +
            '){\n' +
            source +
            '\n})'
    } catch (e) {
        e.filename = path
        e.source = source
        throw e
    }
    return result
}

export { compile }
