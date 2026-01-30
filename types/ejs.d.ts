import { EjsContext } from './context'
import { TemplateError } from './error'

export declare type EjsConfigVars = {
    SCOPE: string
    COMPONENT: string
    ELEMENT: string
    EXTEND: string
    BUFFER: string
    LAYOUT: string
    BLOCKS: string
    MACRO: string
    SAFE: string
}

export declare type EjsConfigToken = {
    start: string
    end: string
    regex: string
}

export declare type EjsConfig = {
    /**
     * Global variable where the compiled templates are stored
     * @default 'ejsPrecompiled'
     */
    precompiled?: string
    /**
     * Cache templates after compiling use false in development only
     * @default true
     */
    cache?: boolean
    /**
     * folder where templates are stored
     * @default 'views'
     */
    path?: string
    /**
     * Template extension in filesystem
     * @default 'ejs'
     */
    extension?: string
    /**
     * Remove all safe-to-remove whitespace, including leading and trailing
     * whitespace. It also enables a safer version of `-%>` line slurping for all
     * scriptlet tags (it does not strip new lines of tags in the middle of a
     * line).
     * @default true
     */
    rmWhitespace?: boolean
    /**
     * Whether to use the `with () {}` construct in generated function templates
     * If set to `false`, data is still accessible through an object whose name
     * is determined in `EjsConfig.vars.SCOPE`
     * @default false
     */
    strict?: boolean
    /**
     * Template source resolver function
     * - For server templates using fs.promises.readFile
     * - For client templates using window.fetch
     * - For worker templates using precompiled Map of templates
     */
    resolver?: (
        path: string,
        template: string,
    ) => Promise<string | TemplateError>
    /**
     * An array of local variables that are always destructured from helpers
     * available even in strict mode.
     */
    globals?: string[]
    /**
     * Template variables
     */
    vars?: Partial<EjsConfigVars>
    token?: Partial<EjsConfigToken>
}

declare type configure = <T extends EjsConfig>(options?: T) => EjsConfig & T

declare type compile = (content: string, path: string) => Function

declare type EjsMethods = { [p: string]: any }

declare type createContext = (data: { [p: string]: any }) => EjsContext

declare type render = (
    name: string,
    data?: { [x: string]: any },
) => Promise<string>

declare type require = (name: string) => Promise<{ [x: string]: any }>

declare type preload = (list: { [p: string]: any }) => void

declare type helpers<T extends EjsMethods> = (
    extendMethods: T,
) => EjsContext & T

declare type create = (config: EjsConfig) => EjsInstance

declare type EjsInterface = {
    configure: configure
    create: create
    createContext: createContext
    render: render
    require: require
    preload: preload
    compile: compile
    helpers: helpers<EjsMethods>
}

declare type EjsInstance = (config: EjsConfig) => EjsInterface

export const configure: configure

export const createContext: createContext

export const render: render

export const require: require

export const preload: preload

export const helpers: helpers<EjsMethods>

export const compile: compile

export const create: EjsInstance
