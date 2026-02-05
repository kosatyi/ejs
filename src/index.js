import { EjsInstance } from './ejs.js'
import { expressRenderer } from './express.js'
import { readFile } from './readfile.js'

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
