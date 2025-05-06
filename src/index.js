import { EJS } from './ejs.js'
import { readFile } from './readfile.js'
import { expressRenderer } from './express.js'
import {
    TemplateError,
    TemplateSyntaxError,
    TemplateNotFound,
} from './error.js'

export { TemplateError, TemplateSyntaxError, TemplateNotFound }

export const { render, context, compile, helpers, preload, configure, create } =
    new EJS({
        resolver: readFile,
    })

export const __express = expressRenderer(configure, render)
