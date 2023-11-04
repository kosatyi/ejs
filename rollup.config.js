import {
    ignore,
    resolve,
    commonjs,
    babel,
    terser,
    jsonFile,
} from '@kosatyi/rollup'

import pkg from './package.json' assert { type: 'json' }

const external = ['path', 'fs']

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
    plugins: [ignore(external), resolve({}), commonjs({}), babel(babelConfig)],
}

const cjs = {
    input: 'src/index.js',
    external: external,
    output: {
        name: 'ejs',
        file: pkg.main,
        format: 'cjs',
        exports: 'auto',
    },
    plugins: [
        resolve({}),
        commonjs({}),
        babel(babelConfig),
        jsonFile('dist/cjs/package.json', { type: 'commonjs' }),
    ],
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

const elementCjs = {
    input: 'src/element.js',
    output: {
        name: 'ejs',
        file: 'dist/cjs/element.js',
        format: 'cjs',
        exports: 'auto',
    },
    plugins: [resolve({}), commonjs({}), babel(babelConfig)],
}

const elementMjs = {
    input: 'src/element.js',
    output: {
        name: 'ejs',
        file: 'dist/esm/element.js',
        format: 'esm',
    },
    plugins: [resolve({}), commonjs({})],
}

export default [umd, cjs, mjs, elementCjs, elementMjs]
