// DEFAULT CONFIGURATION
export const CONFIG = {
    export: 'ejsPrecompiled',
    spaceless: true,
    token: {
        start: '<%',
        end: '%>',
    },
    extension: {
        supported: ['ejs', 'mjs', 'html', 'svg', 'css', 'js'],
        module: 'mjs',
        default: 'ejs',
    },
}

export const EXTEND = '$$$'
export const OUTPUT = '$$i'
export const LAYOUT = '$$l'
export const BLOCKS = '$$b'
export const SCOPE = '$$s'
export const SAFE = '$$v'

export const COMMA = ','
export const BUFFER_START = OUTPUT + "('"
export const BUFFER_END = "');\n"
export const BEFORE_SAFE = SAFE + '('
export const AFTER_SAFE = ')'
export const BEFORE_LINE = "'+\n"
export const AFTER_LINE = "+\n'"
export const BEFORE_EVAL = "')\n"
export const AFTER_EVAL = '\n'
export const COMMENT_START = '/**'
export const COMMENT_END = '**/'
