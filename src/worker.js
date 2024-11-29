import { EJS } from './ejs.js'

const templates = {}
const ejs = new EJS({
    cache: false,
    withObject: false,
    resolver(path, name) {
        if (name in templates) {
            return Promise.resolve(templates[name])
        }
        return Promise.resolve(['template not found', name])
    },
})

export async function useTemplates(list) {
    Object.assign(templates, list || {})
}

const { render, context, compile, helpers, preload, configure, create } = ejs

export { render, context, compile, helpers, preload, configure, create }
