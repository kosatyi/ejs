import { entities } from './utils'

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

function node(tag, attrs, content) {
    const result = []
    const hasClosedTag = selfClosed.indexOf(tag) === -1
    const attributes = Object.entries(attrs || {})
        .filter(([_, value]) => {
            return value !== null && value !== undefined
        })
        .map(([name, value]) => {
            return [
                entities(name),
                [quote, entities(value), quote].join(''),
            ].join(equal)
        })
        .join(space)
    result.push([lt, tag, space, attributes, gt].join(''))
    if (content) {
        result.push(Array.isArray(content) ? content.join('') : content)
    }
    if (hasClosedTag) {
        result.push([lt, slash, tag, gt].join(''))
    }
    return result.join('')
}

export { node }
