import { entities, safeValue } from './utils.js'

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

export const element = (tag, attrs, content) => {
    const result = []
    const hasClosedTag = selfClosed.indexOf(tag) === -1
    const attributes = Object.entries(attrs).map(([key, value]) => {
        if (value !== null && value !== undefined) {
            return [
                entities(key),
                [quote, entities(value), quote].join(''),
            ].join(equal)
        }
    }).join(space)
    result.push([lt, tag, space, attributes, gt].join(''))
    if (content && hasClosedTag) {
        result.push(Array.isArray(content) ? content.join('') : content)
    }
    if (hasClosedTag) {
        result.push([lt, slash, tag, gt].join(''))
    }
    return result.join('')
}

export { safeValue }
