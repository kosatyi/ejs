#! /usr/bin/env node

import argv from 'process.argv'

import { bundler } from '../dist/esm/bundler.js'

const schema = argv(process.argv.slice(2))

const params = schema({
    target: null,
    umd: false,
    strict: true,
    globals: [],
    precompiled: 'ejsPrecompiled',
    path: 'views',
    extension: 'ejs',
})

if (params.globals) {
    params.globals = params.globals
        .split(',')
        .map((s) => String(s).trim())
        .filter((s) => s)
}

if (!params.target) {
    throw new Error('target is not a string')
}

const options = {
    target: params.target,
    minify: params.minify,
    umd: params.umd,
}

/**
 * @type {EjsConfig}
 */
const config = {
    strict: params.strict,
    path: params.path,
    precompiled: params.precompiled,
    extension: params.extension,
    globals: params.globals,
}

const bundle = bundler(options, config)

await bundle.build()

if (params.watch && params.path) {
    await bundle.watch()
}
