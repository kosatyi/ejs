import type { ContextScope } from './context'

declare global {
    const ejs: ContextScope
    interface Window extends ContextScope {}
    namespace NodeJS {
        interface Global extends ContextScope {}
    }
}

export = global
