import { isFunction } from './type.js'
import { EJS } from './ejs.js'
import {
    TemplateError,
    TemplateSyntaxError,
    TemplateNotFound,
} from './error.js'

const templateCache = {}

const getOrigin = (url, secure) => {
    url = URL.parse(url)
    url.protocol = secure ? 'https:' : 'http:'
    return url.origin
}

export const { render, createContext, helpers, configure } = EJS({
    cache: false,
    withObject: false,
    resolver(path, name) {
        return new Promise((resolve, reject) => {
            if (isFunction(templateCache[name])) {
                resolve(templateCache[name])
            } else {
                reject(new TemplateNotFound(`template ${name} not found`))
            }
        })
    },
})

/**
 * @param {Object<string,any>} templates
 */
export function useTemplates(templates = {}) {
    Object.assign(templateCache, templates)
}

/**
 * @deprecated Renamed to `useTemplates`
 * @param {Object<string,any>} templates
 */
export const setTemplates = useTemplates

/**
 * @typedef {{}} HonoContext
 * @property {function(*):Promise<Response>} html
 * @property {function():Promise<Response>} notFound
 * @property {function(methods:{}):void} helpers
 * @property {function(name:string,data:{}):Promise<string>} render
 * @property {function(name:string,data:{}):Promise<string>} ejs
 * @property {ContextScope} data
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

export { TemplateError, TemplateSyntaxError, TemplateNotFound }
