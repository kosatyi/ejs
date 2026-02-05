import { EjsInstance } from './ejs.js'
import { httpRequest } from './fetch.js'

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
