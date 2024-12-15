import { promises as fs } from 'fs'
import { glob } from 'glob'
import watch from 'glob-watcher'
import { dirname, join } from 'path'
import { minify } from 'terser'
import { compile, configure } from './index.js'

const isPlainObject = function(obj) {
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
        umd: true,
        minify: true
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

    stageWrapper(content){
        const umd = this.options.umd
        const module = this.config.export
        const out = []
        if (umd) {
            out.push('(function(global,factory){')
            out.push('typeof exports === "object" && typeof module !== "undefined" ?')
            out.push('module.exports = factory():')
            out.push('typeof define === "function" && define.amd ? define(factory):')
            out.push('(global = typeof globalThis !== "undefined" ? globalThis:')
            out.push(`global || self,global["${module}"] = factory())`)
            out.push('})(this,(function(){')
        }
        out.push(content)
        if (umd) {
            out.push('return templates}))')
        } else {
            out.push('export default templates')
        }
        return out.join('')
    }
    async stageMinify(content) {
        if (this.options.minify === false) return content
        const config = {
            compress: {
                dead_code: false,
                side_effects: false
            }
        }
        const response = await minify(content, config)
        return response.code
    }

    getBundle() {
        const out = []
        if (this.config.withObject === false) out.push(`'use strict'`)
        out.push('const templates = {}')
        Object.entries(this.templates).forEach(([name, content]) => {
            name = JSON.stringify(name)
            content = String(content)
            out.push(`templates[${name}] = ${content}`)
        })
        return out.join('\n')
    }
    async watch() {
        console.log(`ejs-bundler: watching directory - ${this.config.path}`)
        const pattern = '**/*.'.concat(this.config.extension)
        const watcher = watch(pattern, { cwd: this.config.path })
        const state = { build: null }
        watcher.on('change', (path) => {
            if(state.build) return;
            console.log(`ejs-bundler: file is changed - ${path}`)
            state.build = this.build().then(()=>{
                state.build = null
            })
        })
        watcher.on('add', (path) => {
            if(state.build) return;
            console.log(`ejs-bundler: file is added - ${path}`)
            state.build = this.build().then(()=>{
                state.build = null
            })
        })
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
        content = this.stageWrapper(content)
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
        }
    }
}
