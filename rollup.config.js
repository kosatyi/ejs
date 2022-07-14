import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import ignore from 'rollup-plugin-ignore'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const external = ['path', 'fs', 'chokidar']

const babelConfig = {
    babelHelpers: 'bundled',
    presets: ['@babel/preset-env'],
}

const iife = {
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

export default [iife, cjs, mjs]
