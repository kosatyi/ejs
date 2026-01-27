/**
 * @type {ejsConfig}
 */
export const ejsDefaults = {
    export: 'ejsPrecompiled',
    cache: true,
    path: 'views',
    extension: 'ejs',
    rmWhitespace: true,
    withObject: true,
    resolver: (path, template, options = {}) => {
        return Promise.resolve(
            ['resolver is not defined', path, template].join(' ')
        )
    },
    globalHelpers: [],
    vars: {
        SCOPE: 'ejs',
        COMPONENT: 'ui',
        ELEMENT: 'el',
        EXTEND: '$$e',
        BUFFER: '$$a',
        LAYOUT: '$$l',
        BLOCKS: '$$b',
        MACRO: '$$m',
        SAFE: '$$v'
    },
    token: {
        start: '<%',
        end: '%>',
        regex: '([\\s\\S]+?)'
    }
}

