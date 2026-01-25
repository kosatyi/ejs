import { EJS } from './ejs.js'
import { httpRequest } from './fetch.js'
import {
    TemplateError,
    TemplateSyntaxError,
    TemplateNotFound,
} from './error.js'

export const { render, createContext, compile, helpers, preload, configure, create } =
    EJS({
        resolver: httpRequest,
    })

export { TemplateError, TemplateSyntaxError, TemplateNotFound }
