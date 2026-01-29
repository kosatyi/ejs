/**
 * @type {EjsConfig}
 */
export const ejsDefaults = {
    precompiled: 'ejsPrecompiled',
    cache: true,
    path: 'views',
    extension: 'ejs',
    rmWhitespace: true,
    withObject: false,
    resolver: (path, template) => {
        return Promise.resolve(
            ['resolver is not defined', path, template].join(' '),
        )
    },
    globals: {},
    vars: {
        SCOPE: 'ejs',
        COMPONENT: 'ui',
        ELEMENT: 'el',
        EXTEND: '$$e',
        BUFFER: '$$a',
        LAYOUT: '$$l',
        BLOCKS: '$$b',
        MACRO: '$$m',
        SAFE: '$$v',
    },
    token: {
        start: '<%',
        end: '%>',
        regex: '([\\s\\S]+?)',
    },
}
