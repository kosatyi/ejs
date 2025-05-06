import { EJS } from './ejs.js'
import { httpRequest } from './fetch.js'
import {
    TemplateError,
    TemplateSyntaxError,
    TemplateNotFound,
} from './error.js'

const { render, context, compile, helpers, preload, configure, create } =
    new EJS({
        resolver: httpRequest,
    })

export { TemplateError, TemplateSyntaxError, TemplateNotFound }

export { render, context, compile, helpers, preload, configure, create }
