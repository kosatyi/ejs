import { EJS } from './ejs.js'
import { readFile } from './readfile.js'
import { expressRenderer } from './express.js'
import {
    TemplateError,
    TemplateSyntaxError,
    TemplateNotFound,
} from './error.js'

export { TemplateError, TemplateSyntaxError, TemplateNotFound }

export const { render, createContext, compile, helpers, preload, configure, create } =
    EJS({
        resolver: readFile,
    })

export const __express = expressRenderer(configure, render)
