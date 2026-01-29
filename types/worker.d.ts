export {
    create,
    render,
    createContext,
    configure,
    helpers,
    preload,
} from './base'

export { TemplateError, TemplateSyntaxError, TemplateNotFound } from './error'

export type HonoContext = {}

export function setRenderer({
    templates,
    version,
    secure,
}?: {
    [x: string]: any
}): (c: HonoContext) => HonoContext

export function setTemplates(templates?: { [x: string]: any }): void

export function useRenderer({
    templates,
    version,
    secure,
}?: {
    [x: string]: any
}): (c: HonoContext) => HonoContext

export function useTemplates(templates?: { [x: string]: any }): void
