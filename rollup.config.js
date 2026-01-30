import ignore from 'rollup-plugin-ignore'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import copy from 'rollup-plugin-copy'

import path from 'node:path'

const external = ['node:path', 'node:fs/promises']

const babelConfig = {
    babelHelpers: 'bundled',
    presets: ['@babel/preset-env', {}],
}

const copyConfig = {
    targets: [
        {
            src: 'package.cjs.json',
            dest: 'dist/cjs',
            rename() {
                return 'package.json'
            },
        },
    ],
    copyOnce: true,
}

class RollupBuild {
    options = {
        target: 'dist',
    }

    constructor(options = {}) {
        Object.assign(this.options, options)
        this.export = []
    }

    target(type, source, options = {}) {
        const { target } = this.options
        const baseName = path.basename(source)
        const fileParse = path.parse(baseName)
        const fileName = path.format(Object.assign({}, fileParse, options))
        return path.resolve(options.target ?? target, type, fileName)
    }

    add(name, source) {
        this.push({
            input: source,
            output: [
                {
                    name: name,
                    file: this.target('umd', source),
                    format: 'umd',
                },
                {
                    name: name,
                    file: this.target('umd', source, {
                        base: null,
                        ext: '.min.js',
                    }),
                    format: 'umd',
                    plugins: [terser()],
                },
                {
                    name: name,
                    file: this.target('', source, { target: 'public/dist' }),
                    format: 'umd',
                    //plugins: [terser()],
                },
            ],
            plugins: [
                ignore(external),
                commonjs({}),
                resolve({}),
                babel(babelConfig),
            ],
        })
        this.push({
            input: source,
            external: external,
            output: {
                name: name,
                file: this.target('cjs', source),
                format: 'cjs',
                exports: 'auto',
            },
            plugins: [
                commonjs({}),
                resolve({}),
                babel(babelConfig),
                copy(copyConfig),
            ],
        })
        this.push({
            input: source,
            external: external,
            output: {
                name: name,
                file: this.target('esm', source),
                format: 'esm',
            },
            plugins: [commonjs({}), resolve({})],
        })
    }

    push(config) {
        this.export.push(config)
    }
}

const build = new RollupBuild({ target: 'dist' })

build.add('ejsInstance', 'src/index.js')
build.add('ejsInstance', 'src/browser.js')
build.add('ejsInstance', 'src/worker.js')
build.add('element', 'src/element.js')
build.push({
    input: 'src/bundler.js',
    output: [
        {
            file: 'dist/esm/bundler.js',
            format: 'esm',
        },
        {
            file: 'dist/cjs/bundler.js',
            format: 'cjs',
        },
    ],
    external: [
        'node:fs/promises',
        'node:path',
        'glob',
        'glob-watcher',
        './index.js',
    ],
    plugins: [],
})

export default build.export
