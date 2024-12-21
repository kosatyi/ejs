import { EJS } from './ejs.js'
import { httpRequest } from './fetch.js'
import { TemplateError, TemplateSyntaxError, TemplateNotFound } from './error.js'

const ejs = new EJS({ resolver: httpRequest })

const { render, context, compile, helpers, preload, configure, create } = ejs

export { TemplateError, TemplateSyntaxError, TemplateNotFound }

export { render, context, compile, helpers, preload, configure, create }
