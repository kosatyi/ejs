import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

const umd = {
    input: 'src/index.js',
    output: {
        name: 'ejs',
        file: pkg.main,
        format: 'umd',
        globals: {
            fs: 'fs',
            path: 'path',
            chokidar: 'chokidar',
        },
    },
    external: ['fs', 'chokidar', 'path'],
    plugins: [
        commonjs({}),
        resolve({ browser: true }),
        babel({
            presets: ['@babel/preset-env'],
        }),
    ],
}

const mjs = {
    input: 'src/index.js',
    output: {
        file: pkg.module,
        format: 'es',
        globals: {
            fs: 'fs',
            path: 'path',
            chokidar: 'chokidar',
        },
    },
    external: ['fs', 'chokidar', 'path'],
    plugins: [commonjs({}), resolve({})],
}

export default [umd, mjs]
