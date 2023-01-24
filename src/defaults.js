const defaults = {}

defaults.export = 'ejs.precompiled'

defaults.cache = true

defaults.path = 'views'

defaults.resolver = null

defaults.extension = 'ejs'

defaults.vars = {
    EXTEND: '$$$',
    BUFFER: '$$a',
    OUTPUT: '$$i',
    LAYOUT: '$$l',
    BLOCKS: '$$b',
    MACRO: '$$m',
    ERROR: '$$e',
    SCOPE: '$$s',
    SAFE: '$$v',
}

defaults.token = {
    start: '<%',
    end: '%>',
    regex: '([\\s\\S]+?)',
}

export default defaults
