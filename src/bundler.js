import { promises as fs } from 'fs'
import { glob } from 'glob'
import { dirname, extname, join } from 'path'
import { minify } from 'terser'
import { compile, configure } from './index.js'

const isPlainObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
}

const extend = (target, ...sources) => {
    return Object.assign(target, ...sources.filter(isPlainObject))
}

export class Bundler {
    /**
     * @type {BundlerOptions}
     */
    options = {
        target: [],
        transform: false,
        minify: false,
        timestamp: true,
    }
    /**
     * @type {EjsConfig}
     */
    config = {}
    constructor(options, config) {
        extend(this.options, options || {})
        this.config = configure(config || {})
        this.templates = {}
    }
    stageRead(path) {
        return fs
            .readFile(join(this.config.path, path))
            .then((response) => response.toString())
    }
    stageCompile(content, name) {
        return compile(content, name).source
    }
    async stageMinify(content) {
        if (this.options.minify === false) return content
        const config = {
            compress: {
                dead_code: false,
                side_effects: false,
            },
        }
        const response = await minify(content, config)
        return response.code
    }
    getBundle() {
        const transform = this.options.transform
        const moduleId = this.config.export
        const useStrict = this.config.withObject === false
        const out = []
        if (transform) {
            out.push('(function(global,factory){')
            out.push(
                'typeof exports === "object" && typeof module !== "undefined" ?'
            )
            out.push('module.exports = factory():')
            out.push(
                'typeof define === "function" && define.amd ? define(factory):'
            )
            out.push(
                '(global = typeof globalThis !== "undefined" ? globalThis:'
            )
            out.push('global || self,global["' + moduleId + '"] = factory())')
            out.push('})(this,(function(){')
        }
        if (useStrict) out.push("'use strict'")
        out.push('const templates = {}')
        Object.entries(this.templates).forEach(([name, content]) => {
            name = JSON.stringify(name)
            content = String(content)
            out.push(`templates[${name}] = ${content}`)
        })
        if (transform) {
            out.push('return templates')
            out.push('}))')
        } else {
            out.push('export default templates')
        }
        return out.join('\n')
    }
    async watch() {
        console.log(`ejs-bundler: watching directory - ${this.config.path}`)
        try {
            const watcher = fs.watch(this.config.path, { recursive: true })
            for await (const { filename } of watcher) {
                if (extname(filename).slice(1) === this.config.extension) {
                    console.log(`ejs-bundler: file is changed - ${filename}`)
                    await this.build()
                }
            }
        } catch (err) {
            throw err
        }
    }
    async build() {
        if (this.buildInProgress === true) return false
        this.buildInProgress = true
        await this.concat().catch(console.error)
        await this.output().catch(console.error)
        console.log(`ejs-bundler: bundle complete - ${this.options.target}`)
        this.buildInProgress = false
    }
    async concat() {
        const pattern = '**/*.'.concat(this.config.extension)
        const list = await glob(pattern, { cwd: this.config.path })
        for (let template of list) {
            let content = ''
            content = await this.stageRead(template)
            content = await this.stageCompile(content, template)
            this.templates[template] = content
        }
    }
    async output() {
        const target = [].concat(this.options.target)
        let content = this.getBundle()
        if (this.options.minify) {
            content = await this.stageMinify(content)
        }
        for (let file of target) {
            const folderPath = dirname(file)
            const folderExists = await fs
                .stat(folderPath)
                .then(() => true)
                .catch(() => false)
            if (folderExists === false) {
                await fs.mkdir(folderPath, { recursive: true })
            }
            await fs.writeFile(file, content)
        }
    }
}

export const ejsBundler = (options, config) => {
    const bundler = new Bundler(options, config)
    return {
        name: 'ejs-bundler',
        async buildStart() {
            await bundler.concat()
        },
        async buildEnd() {
            await bundler.output()
        },
    }
}
