import { ignore, resolve, commonjs, babel, terser, copy } from '@kosatyi/rollup'
import path from 'path'

const external = ['path', 'fs', 'chokidar']

const babelConfig = {
    babelHelpers: 'bundled',
    presets: ['@babel/preset-env'],
}

const copyConfig = {
    targets: [
        {
            src: 'package.cjs.json',
            dest: 'dist/cjs',
            rename(name, extension, fullPath) {
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
        return path.resolve(target, type, fileName)
    }
    add(name, source) {
        this.export.push(
            {
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
                ],
                plugins: [
                    ignore(external),
                    commonjs({}),
                    resolve({}),
                    babel(babelConfig),
                ],
            },
            {
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
            },
            {
                input: source,
                external: external,
                output: {
                    name: name,
                    file: this.target('esm', source),
                    format: 'esm',
                },
                plugins: [commonjs({}), resolve({})],
            }
        )
    }
}

const build = new RollupBuild({ target: 'dist' })

build.add('ejs', 'src/index.js')
build.add('ejs', 'src/browser.js')
build.add('element', 'src/element.js')

export default build.export
