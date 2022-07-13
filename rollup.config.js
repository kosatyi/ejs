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
        format: 'umd',
    },
    plugins: [
        ignore(external),
        resolve({
            browser: true,
            preferBuiltins: false,
        }),
        commonjs({}),
        babel({
            babelHelpers: 'bundled',
            plugins: ['@babel/plugin-proposal-class-properties'],
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
    external: ['fs', 'path', 'chokidar'],
    plugins: [
        resolve({}),
        commonjs({}),
        babel({
            babelHelpers: 'bundled',
            plugins: ['@babel/plugin-proposal-class-properties'],
            presets: ['@babel/preset-env'],
        }),
    ],
}

const mjs = {
    input: 'src/index.js',
    output: {
        name: 'ejs',
        file: pkg.module,
        format: 'esm',
    },
    external: ['fs', 'path', 'chokidar'],
    plugins: [resolve({}), commonjs({})],
}

export default [iife, cjs, mjs]
