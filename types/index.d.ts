export { element, escapeValue } from './element.js'

export {
    create,
    render,
    createContext,
    configure,
    helpers,
    preload,
} from './ejs.js'

export const __express: (
    name: string,
    options: object,
    callback: Function,
) => any
