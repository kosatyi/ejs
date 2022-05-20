const defaults = {}

defaults.loader = {
    precompiled: 'ejsPrecompiled',
}

defaults.extension = {
    supported: ['ejs', 'mjs', 'html', 'svg', 'css', 'js'],
    module: 'mjs',
    default: 'ejs',
    export: 'ejsPrecompiled',
}

defaults.vars = {
    EXTEND: '$$$',
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
    match: '([\\s\\S]+?)',
}

defaults.tags = {
    '-'(value) {
        return `'+\n${this.SAFE}(${value},1)+\n'`
    },
    '='(value) {
        return `'+\n${this.SAFE}(${value})+\n'`
    },
    '#'(value) {
        return `'+\n/**${value}**/+\n'`
    },
    ''(value) {
        return `'\n${value}\n${this.OUTPUT}+='`
    },
}

module.exports = defaults
