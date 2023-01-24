import { ignore, resolve, commonjs, babel, terser } from '@kosatyi/rollup'

import pkg from './package.json'

const external = ['path', 'fs', 'chokidar']

const babelConfig = {
    babelHelpers: 'bundled',
    presets: ['@babel/preset-env'],
}

const umd = {
    input: 'src/index.js',
    output: [
        {
            name: 'ejs',
            file: pkg.browser,
            format: 'umd',
        },
        {
            name: 'ejs',
            file: pkg.minified,
            format: 'umd',
            plugins: [terser()],
        },
    ],
    plugins: [
        ignore(external),
        resolve({}),
        commonjs({}),
        babel(babelConfig)
    ],
}

const cjs = {
    input: 'src/index.js',
    external: external,
    output: {
        name: 'ejs',
        file: pkg.main,
        format: 'cjs',
        exports: 'default',
    },
    plugins: [resolve({}), commonjs({}), babel(babelConfig)],
}

const mjs = {
    input: 'src/index.js',
    external: external,
    output: {
        name: 'ejs',
        file: pkg.module,
        format: 'esm',
    },
    plugins: [resolve({}), commonjs({})],
}

export default [umd, cjs, mjs]
