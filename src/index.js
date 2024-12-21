import { EJS } from './ejs.js'
import { readFile } from './readfile.js'
import { expressRenderer } from './express.js'
import { TemplateError, TemplateSyntaxError, TemplateNotFound } from './error.js'

const ejs = new EJS({ resolver: readFile })

const { render, context, compile, helpers, preload, configure, create } = ejs

export const __express = expressRenderer(ejs)

export { TemplateError, TemplateSyntaxError, TemplateNotFound }

export { render, context, compile, helpers, preload, configure, create }
