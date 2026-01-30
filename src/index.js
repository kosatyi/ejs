import { EjsInstance } from './ejs.js'
import { expressRenderer } from './express.js'
import { readFile } from './readfile.js'
export {
    TemplateError,
    TemplateSyntaxError,
    TemplateNotFound,
} from './error.js'

export const {
    render,
    createContext,
    compile,
    helpers,
    preload,
    configure,
    create,
} = new EjsInstance({
    resolver: readFile,
})

export const __express = expressRenderer(configure, render)
