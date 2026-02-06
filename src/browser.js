import { EjsInstance } from './ejs/index.js'
import { joinPath } from './ejs/utils.js'

const resolver = async (path, template, error) => {
    return fetch(joinPath(path, template)).then(
        (response) => {
            if (response.ok) return response.text()
            return error(1, `template ${template} not found`)
        },
        (reason) => error(0, reason),
    )
}

export const {
    render,
    configure,
    create,
    helpers,
    createContext,
    compile,
    preload,
} = new EjsInstance({
    resolver,
})
