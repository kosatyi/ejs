export {
    create,
    render,
    createContext,
    configure,
    helpers,
    preload,
} from './base'
export { TemplateError, TemplateSyntaxError, TemplateNotFound } from './error'

export const __express: (
    name: string,
    options: object,
    callback: Function,
) => any
