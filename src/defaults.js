const defaults = {}

defaults.loader = {
    export: 'ejs.precompiled',
    path: 'views',
}

defaults.extension = {
    supported: ['ejs', 'mjs', 'html', 'svg', 'css', 'js'],
    module: 'mjs',
    default: 'ejs',
    export: 'ejs.precompiled',
}

defaults.vars = {
    EXTEND: '$$$',
    BUFFER: '$$a',
    OUTPUT: '$$i',
    LAYOUT: '$$l',
    MACROS: '$$m',
    PRINT: '$$j',
    BLOCKS: '$$b',
    SCOPE: '$$s',
    SAFE: '$$v',
}

defaults.token = {
    start: '<%',
    end: '%>',
    regex: '([\\s\\S]+?)',
}

module.exports = defaults
