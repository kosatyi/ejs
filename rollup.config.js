import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import ignore from 'rollup-plugin-ignore'

import pkg from './package.json'
const external = ['path', 'fs', 'chokidar']

const iife = {
    input: 'src/index.js',
    output: {
        name: 'ejs',
        file: pkg.browser,
        format: 'iife',
    },
    plugins: [
        ignore(external),
        commonjs({}),
        resolve({
            browser: true,
        }),
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env'],
        }),
    ],
}

const cjs = {
    input: 'src/index.js',
    output: {
        name: 'ejs',
        file: pkg.main,
        format: 'cjs',
        exports: 'default',
    },
    plugins: [
        commonjs({
            ignore: external,
        }),
        resolve({}),
    ],
}

const mjs = {
    input: 'src/index.js',
    output: {
        name: 'ejs',
        file: pkg.module,
        format: 'esm',
    },
    plugins: [
        commonjs({
            ignore: external,
        }),
        resolve({}),
    ],
}

export default [iife, cjs, mjs]
