const defaults = {}

defaults.export = 'ejs.precompiled'

defaults.cache = true

defaults.path = 'views'

defaults.resolver = null

defaults.extension = 'ejs'

defaults.withObject = false

defaults.vars = {
    SCOPE: 'ejs',
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

export default defaults
