import { EjsInstance } from './ejs/index.js'
import { httpRequest } from './ejs/fetch.js'

export const {
    render,
    configure,
    create,
    helpers,
    createContext,
    compile,
    preload,
} = new EjsInstance({
    resolver: httpRequest,
})
