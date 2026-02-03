import type { EjsContext } from './context.js'
import type { EjsInterface } from './ejs.js'
declare global {
    const ejs: EjsContext
    const ejsInstance: EjsInterface
    interface Window extends EjsContext {}
    namespace NodeJS {
        interface Global extends EjsContext {}
    }
}
export = global
