const { entities, map } = require('./utils')

const selfClosed = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
]

const space = ' '
const quote = '"'
const equal = '='
const slash = '/'
const lt = '<'
const gt = '>'

function element(tag, attrs, content) {
    const result = []
    const hasClosedTag = selfClosed.indexOf(tag) === -1
    const attributes = map(attrs, function (value, key) {
        if (value !== null && value !== undefined) {
            return [
                entities(key),
                [quote, entities(value), quote].join(''),
            ].join(equal)
        }
    }).join(space)
    result.push([lt, tag, space, attributes, gt].join(''))
    if (content) {
        result.push(content instanceof Array ? content.join('') : content)
    }
    if (hasClosedTag) {
        result.push([lt, slash, tag, gt].join(''))
    }
    return result.join('')
}

module.exports = element
