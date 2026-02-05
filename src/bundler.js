import fs from 'node:fs/promises'
import globWatch from 'glob-watcher'
import { dirname, join } from 'node:path'
import { bindContext } from './utils.js'
import { create } from './index.js'
import { glob } from 'glob'

export class EjsBundler {
    #templates = {}
    #bundlerOptions = {
        target: [],
        umd: true,
        minify: true,
    }
    #compile
    #ejsOptions
    #buildInProgress
    static exports = ['build', 'watch', 'concat', 'output']
    constructor(bundlerOptions = {}, ejsOptions = {}) {
        bindContext(this, this.constructor.exports)
        const { compile, configure } = create(ejsOptions)
        Object.assign(this.#bundlerOptions, bundlerOptions)
        this.#compile = compile
        this.#ejsOptions = configure({})
        this.#buildInProgress = false
        this.#templates = {}
    }
    async #stageRead(path) {
        return fs
            .readFile(join(this.#ejsOptions.path, path))
            .then((response) => response.toString())
    }
    #stageCompile(content, name) {
        return this.#compile(content, name).source
    }
    #getBundle() {
        const umd = this.#bundlerOptions.umd
        const strict = this.#ejsOptions.strict
        const module = this.#ejsOptions.precompiled
        const out = []
        if (umd) {
            out.push('(function(global,factory){')
            out.push(
                'typeof exports === "object" && typeof module !== "undefined" ?',
            )
            out.push('module.exports = factory():')
            out.push(
                'typeof define === "function" && define.amd ? define(factory):',
            )
            out.push(
                '(global = typeof globalThis !== "undefined" ? globalThis:',
            )
            out.push(`global || self,global["${module}"] = factory())`)
            out.push('})(this,(function(){')
        }
        if (strict) out.push(`'use strict'`)
        out.push('const templates = {}')
        Object.entries(this.#templates).forEach(([name, content]) => {
            name = JSON.stringify(name)
            content = String(content)
            out.push(`templates[${name}] = ${content}`)
        })
        if (umd) {
            out.push('return templates}))')
        } else {
            out.push('export default templates')
        }
        return out.join('\n')
    }
    async build() {
        if (this.#buildInProgress === true) return false
        this.#buildInProgress = true
        await this.concat().catch(console.error)
        await this.output().catch(console.error)
        console.log('✅', 'bundle complete:', this.#bundlerOptions.target)
        this.#buildInProgress = false
    }
    async watch() {
        console.log('🔍', 'watch directory:', this.#ejsOptions.path)
        const pattern = '**/*.'.concat(this.#ejsOptions.extension)
        const watcher = globWatch(pattern, { cwd: this.#ejsOptions.path })
        const state = { build: null }
        watcher.on('change', (path) => {
            if (state.build) return
            console.log('⟳', 'file change:', path)
            state.build = this.build().then(() => {
                state.build = null
            })
        })
        watcher.on('add', (path) => {
            if (state.build) return
            console.log('+', 'file added:', path)
            state.build = this.build().then(() => {
                state.build = null
            })
        })
    }
    async concat() {
        const pattern = '**/*.'.concat(this.#ejsOptions.extension)
        const list = await glob(
            pattern,
            { cwd: this.#ejsOptions.path },
            () => {},
        )
        for (let template of list) {
            let content = ''
            content = await this.#stageRead(template)
            content = await this.#stageCompile(content, template)
            this.#templates[template] = content
        }
    }
    async output() {
        const target = [].concat(this.#bundlerOptions.target)
        const content = this.#getBundle()
        for (const file of target) {
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

export const bundler = (bundlerOptions = {}, ejsOptions = {}) => {
    return new EjsBundler(bundlerOptions, ejsOptions)
}

export const ejsRollupBundler = (bundlerOptions, ejsOptions) => {
    const bundle = bundler(bundlerOptions, ejsOptions)
    return {
        name: 'ejs-bundler',
        async buildStart() {
            await bundle.concat()
        },
        async buildEnd() {
            await bundle.output()
        },
    }
}
