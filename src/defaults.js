export const defaults = {}

defaults.export = 'ejsPrecompiled'

defaults.watch = false

defaults.path = 'views'

defaults.resolver = null

defaults.extension = 'ejs'

defaults.rmWhitespace = true

defaults.withObject = true

defaults.vars = {
    SCOPE: 'ejs',
    COMPONENT: 'ui',
    EXTEND: '$$e',
    BUFFER: '$$a',
    LAYOUT: '$$l',
    BLOCKS: '$$b',
    MACRO: '$$m',
    SAFE: '$$v',
}

defaults.token = {
    start: '<%',
    end: '%>',
    regex: '([\\s\\S]+?)',
}
