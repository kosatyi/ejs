import type { EjsContext } from './context'
import type { EjsInterface } from './ejs'
declare global {
    const ejs: EjsContext
    const ejsInstance: EjsInterface
    interface Window extends EjsContext {}
    namespace NodeJS {
        interface Global extends EjsContext {}
    }
}
export = global
