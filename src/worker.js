import { EJS } from './ejs.js'

import { TemplateError, TemplateSyntaxError, TemplateNotFound } from './error.js'

const hash = Math.floor(Math.random() * 1e12).toString(36)
const templates = {}
const ejs = new EJS({
    cache: false,
    withObject: false,
    resolver(path, name) {
        return new Promise((resolve, reject) => {
            if (templates.hasOwnProperty(name)) {
                resolve(templates[name])
            } else {
                reject(new TemplateNotFound(`template ${name} not found`))
            }
        })
    }
})

const { render, context, helpers, configure, create } = ejs

const getOrigin = (url, secure) => {
    url = new URL(url)
    if (secure) url.protocol = 'https:'
    return url.origin
}


export function setTemplates(list) {
    Object.assign(templates, list || {})
}

/**
 * @typedef {Object<string,any>} HonoContext
 * @property {function(*):Promise<Response>} html
 * @property {function():Promise<Response>} notFound
 * @property {function(methods:{}):void} helpers
 * @property {function(name:string,data:{}):Promise<string>} render
 * @property {function(name:string,data:{}):Promise<string>} ejs
 * @property {ContextScope} data
 */

/**
 * @param {Object<string,any>} options
 * @return {(function(c:Context, next): Promise<any>)|*}
 */
export function setRenderer({ version = hash, secure = true } = {}) {
    return async (c, next) => {
        c.data = context({})
        c.data.set('version', version)
        c.data.set('origin', getOrigin(c.req.url, secure))
        c.data.set('path', c.req.path)
        c.data.set('query', c.req.query())
        c.ejs = (name, data) => render(name, Object.assign({
            param: c.req.param(),
        }, c.data, data))
        c.helpers = (methods) => helpers(methods)
        c.render = (name, data) => c.html(c.ejs(name, data))
        await next()
    }
}

export const version = hash

export { TemplateError, TemplateSyntaxError, TemplateNotFound }

export { render, context, helpers, configure, create }
