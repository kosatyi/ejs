const defaults = {}

defaults.export = 'ejs.precompiled'
defaults.browser = true
defaults.path = 'views'

defaults.extension = {
    supported: ['ejs', 'js', 'html', 'svg', 'css'],
    default: 'ejs',
    module: 'js',
}

defaults.vars = {
    EXTEND: '$$$',
    BUFFER: '$$a',
    OUTPUT: '$$i',
    LAYOUT: '$$l',
    MACROS: '$$m',
    PRINT: '$$j',
    BLOCKS: '$$b',
    ERROR: '$$e',
    SCOPE: '$$s',
    SAFE: '$$v',
}

defaults.token = {
    start: '<%',
    end: '%>',
    regex: '([\\s\\S]+?)',
}

module.exports = defaults
