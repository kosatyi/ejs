import fs from 'node:fs/promises'
import globWatch from 'glob-watcher'
import { dirname, join } from 'node:path'
import { glob } from 'glob'
import { create } from './index.js'

export const bundler = (params = {}, ejsParams = {}) => {
    const config = {
        target: [],
        umd: true,
        minify: true,
    }
    const { compile, configure } = create(ejsParams)
    const ejsConfig = configure()
    const templates = {}
    Object.assign(config, params || {})
    const stageRead = (path) => {
        return fs
            .readFile(join(ejsConfig.path, path))
            .then((response) => response.toString())
    }
    const stageCompile = (content, name) => {
        return compile(content, name).source
    }
    const getBundle = () => {
        const umd = config.umd
        const strict = ejsConfig.withObject === false
        const module = ejsConfig.export
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
        Object.entries(templates).forEach(([name, content]) => {
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
    const watch = async () => {
        console.log('🔍', 'watch directory:', ejsConfig.path)
        const pattern = '**/*.'.concat(ejsConfig.extension)
        const watcher = globWatch(pattern, { cwd: ejsConfig.path })
        const state = { build: null }
        watcher.on('change', (path) => {
            if (state.build) return
            console.log('⟳', 'file change:', path)
            state.build = build().then(() => {
                state.build = null
            })
        })
        watcher.on('add', (path) => {
            if (state.build) return
            console.log('+', 'file added:', path)
            state.build = build().then(() => {
                state.build = null
            })
        })
    }
    const concat = async () => {
        const pattern = '**/*.'.concat(ejsConfig.extension)
        const list = await glob(pattern, { cwd: ejsConfig.path })
        for (let template of list) {
            let content = ''
            content = await stageRead(template)
            content = await stageCompile(content, template)
            templates[template] = content
        }
    }
    const build = async () => {
        if (config.buildInProgress === true) return false
        config.buildInProgress = true
        await concat().catch(console.error)
        await output().catch(console.error)
        console.log('✅', 'bundle complete:', config.target)
        config.buildInProgress = false
    }
    const output = async () => {
        const target = [].concat(config.target)
        const content = getBundle()
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
    return {
        build,
        watch,
        concat,
        output,
    }
}

export const ejsBundler = (options, config) => {
    const bundle = bundler(options, config)
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
