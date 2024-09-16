export const defaults = {}

defaults.export = 'ejsPrecompiled'
defaults.cache = true
defaults.chokidar = null
defaults.path = 'views'
defaults.resolver = function (path, template) {
    return Promise.resolve(
        ['resolver is not defined', path, template].join(' ')
    )
}
defaults.extension = 'ejs'
defaults.rmWhitespace = true
defaults.withObject = true
defaults.globalHelpers = []
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
