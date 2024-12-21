import { EJS } from './ejs.js'
import { TemplateError, TemplateSyntaxError, TemplateNotFound } from './error.js'

const templateCache = {}

const ejs = new EJS({
    cache: false,
    withObject: false,
    resolver(path, name) {
        return new Promise((resolve, reject) => {
            if (templateCache.hasOwnProperty(name)) {
                resolve(templateCache[name])
            } else {
                reject(new TemplateNotFound(`template ${name} not found`))
            }
        })
    }
})

const getOrigin = (url, secure) => {
    url = new URL(url)
    if (secure) url.protocol = 'https:'
    return url.origin
}

export function setTemplates(list) {
    Object.assign(templateCache, list || {})
}

/**
 * @typedef {Object<string,any>} HonoContext
 * @property {function(*):Promise<Response>} html
 * @property {function():Promise<Response>} notFound
 * @property {function(name:string,data:{}):Promise<string>} render
 * @property {function(name:string,data:{}):Promise<string>} ejs
 * @property {ContextScope} data
 */

/**
 *
 * @param {Object<string,any>} options
 * @return {(function(c:Context, next): Promise<any>)|*}
 */
export function setRenderer({ secure = true, version = '1.0', errorHandler }) {
    return async (c, next) => {
        c.data = context({})
        c.data.set('version', version)
        c.data.set('origin', getOrigin(c.req.url, secure))
        c.ejs = (name, data) => render(name, Object.assign({}, c.data, data))
        c.render = (name, data) => c.html(c.ejs(name, data))
        await next()
    }
}

const { render, context, compile, helpers, preload, configure, create } = ejs

export { TemplateError, TemplateSyntaxError, TemplateNotFound }
export { render, context, compile, helpers, preload, configure, create }
