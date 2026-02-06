import { EjsInstance } from './ejs/index.js'
import { expressRenderer } from './ejs/express.js'
import { readFile } from './ejs/readfile.js'

export const {
    render,
    helpers,
    configure,
    create,
    createContext,
    compile,
    preload,
} = new EjsInstance({
    resolver: readFile,
})

export const __express = expressRenderer(configure, render)
