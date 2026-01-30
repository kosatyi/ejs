import { EjsInstance } from './ejs.js'
import { httpRequest } from './fetch.js'
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
    resolver: httpRequest,
})
