#! /usr/bin/env node

import argv from 'process.argv'

import { bundler } from '../dist/esm/bundler.js'

const schema = argv(process.argv.slice(2))

const params = schema({
    target: null,
    umd: false,
    withObject: false,
    precompiled: 'ejsPrecompiled',
    path: 'views',
    extension: 'ejs',
})

if (typeof params.target !== 'string') {
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
    withObject: params.withObject,
    path: params.path,
    precompiled: params.precompiled,
    extension: params.extension,
}

const bundle = bundler(options, config)

await bundle.build()

if (params.watch && params.path) {
    await bundle.watch()
}
