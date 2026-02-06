import { isFunction } from './ejs/type.js'
import { EjsInstance } from './ejs/index.js'

const templateCache = {}

const getOrigin = (url, secure) => {
    url = URL.parse(url)
    url.protocol = secure ? 'https:' : 'http:'
    return url.origin
}

export const { render, createContext, helpers, configure } = new EjsInstance({
    cache: false,
    strict: true,
    async resolver(path, name, error) {
        if (isFunction(templateCache[name])) {
            return templateCache[name]
        }
        error(404, `template ${name} not found`)
    },
})

export function useTemplates(templates = {}) {
    Object.assign(templateCache, templates)
}

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
