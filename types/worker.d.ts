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

export type RendererParams = {
    templates?: { [p: string]: Function }
    version?: number | string
    secure?: boolean | string
    [key: string]: any
}

export function setRenderer(
    options: RendererParams,
): (c: HonoContext) => Promise<HonoContext>

export function setTemplates(templates?: { [x: string]: any }): void

export function useRenderer(
    options: RendererParams,
): (c: HonoContext) => Promise<HonoContext>

export function useTemplates(templates?: { [x: string]: any }): void
