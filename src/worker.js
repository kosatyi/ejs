import { isFunction } from './type.js'
import { EJS } from './ejs.js'
import {
    TemplateError,
    TemplateSyntaxError,
    TemplateNotFound,
} from './error.js'

export { TemplateError, TemplateSyntaxError, TemplateNotFound }

/**
 * @type {{[p:string]:any}}
 */
const templateCache = {}

const getOrigin = (url, secure) => {
    url = URL.parse(url)
    url.protocol = secure ? 'https:' : 'http:'
    return url.origin
}

export const { render, createContext, helpers, configure } = EJS({
    cache: false,
    withObject: false,
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
 * @deprecated Renamed to `useTemplates`
 * @param {{[p:string],Function}} templates
 */
export const setTemplates = useTemplates

/**
 * @typedef {{}} HonoContext
 * @property {function(*):Promise<Response>} html
 * @property {function():Promise<Response>} notFound
 * @property {function(methods:{}):void} helpers
 * @property {function(name:string,data:{}):Promise<string>} render
 * @property {function(name:string,data:{}):Promise<string>} ejs
 * @property {EjsContext} data
 */
/**
 * @param {Object<string,any>} options
 * @return {(function(c:HonoContext, next): Promise<any>)|*}
 */
export function useRenderer({ templates = {}, version, secure = true } = {}) {
    useTemplates(templates)
    return async (c, next) => {
        c.data = createContext({})
        c.data.set('version', version)
        c.data.set('origin', getOrigin(c.req.url, secure))
        c.data.set('path', c.req.path)
        c.data.set('query', c.req.query())
        c.ejs = (name, data) =>
            render(name, Object.assign({ param: c.req.param() }, c.data, data))
        c.helpers = (methods) => helpers(methods)
        c.render = (name, data) => c.html(c.ejs(name, data))
        await next()
    }
}

/**
 * @deprecated Renamed to `useRenderer`
 */
export const setRenderer = useRenderer
