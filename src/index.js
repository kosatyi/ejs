import { EJS } from './ejs.js'
import { expressRenderer } from './express.js'
import { readFile } from './readfile.js'

const ejs = new EJS({ resolver: readFile })

export const { render, context, compile, helpers, preload, configure, create } =
    ejs

export const __express = expressRenderer(ejs)
