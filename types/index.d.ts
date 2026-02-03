export {
    create,
    render,
    createContext,
    configure,
    helpers,
    preload,
} from './ejs.js'

export { TemplateError, TemplateSyntaxError, TemplateNotFound } from './error'

export const __express: (
    name: string,
    options: object,
    callback: Function,
) => any
