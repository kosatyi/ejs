#! /usr/bin/env node

import argv from 'process.argv'

import { Bundler } from '../dist/esm/bundler.js'

const schema = argv(process.argv.slice(2))

const params = schema({
    target: null,
    umd: false,
    withObject: false,
    export: 'ejsPrecompiled',
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

const config = {
    withObject: params.withObject,
    path: params.path,
    export: params.export,
    extension: params.extension,
}

const bundler = new Bundler(options, config)

await bundler.build()

if (params.watch && params.path) {
    await bundler.watch()
}
