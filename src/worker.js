import { isFunction } from './type.js'
import { EjsInstance } from './ejs.js'
import {
    TemplateError,
    TemplateSyntaxError,
    TemplateNotFound,
} from './error.js'

export { TemplateError, TemplateSyntaxError, TemplateNotFound }

/**
 * @type {{[p:string]:Function}}
 */
const templateCache = {}

const getOrigin = (url, secure) => {
    url = URL.parse(url)
    url.protocol = secure ? 'https:' : 'http:'
    return url.origin
}

export const { render, createContext, helpers, configure } = new EjsInstance({
    cache: false,
    strict: true,
    async resolver(path, name) {
        if (isFunction(templateCache[name])) {
            return templateCache[name]
        } else {
            throw new TemplateNotFound(`template ${name} not found`)
        }
    },
})

/**
 * @param {{[p:string],Function}} templates
 */
export function useTemplates(templates = {}) {
    Object.assign(templateCache, templates)
}

/**
 * @typedef {{[p:string]:any}} HonoContext
 * @property {function(*):Promise<Response>} html
 * @property {function():Promise<Response>} notFound
 * @property {function(methods:{}):void} helpers
 * @property {function(name:string,data:{}):Promise<string>} render
 * @property {function(name:string,data:{}):Promise<string>} ejs
 * @property {EjsContext} data
 */
/**
 * @param {RendererParams} options
 * @return {(function(c:HonoContext, next): Promise<any>)|*}
 */
export function useRenderer(options = {}) {
    useTemplates(options.templates ?? {})
    return async (c, next) => {
        c.data = createContext({})
        c.data.set('version', options.version)
        c.data.set('origin', getOrigin(c.req.url, options.secure ?? true))
        c.data.set('path', c.req.path)
        c.data.set('query', c.req.query())
        c.ejs = async (name, data) =>
            render(name, Object.assign({ param: c.req.param() }, c.data, data))
        c.helpers = (methods) => helpers(methods)
        c.render = async (name, data) => c.html(c.ejs(name, data))
        await next()
    }
}
