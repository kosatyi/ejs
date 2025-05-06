import type { EJS } from './ejs'

declare global {
    const ejs: EJS
    interface Window extends EJS {}
    namespace NodeJS {
        interface Global extends EJS {}
    }
}

export = global
