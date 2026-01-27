import { ContextScope } from './context'

declare type ejsConfig = {
    export?: string
    cache?: boolean
    path?: string
    extension?: string
    rmWhitespace?: boolean
    withObject?: boolean
    resolver?: (
        path: string,
        template: string,
        options: ejsConfig,
    ) => Promise<Awaited<string>>
    globalHelpers?: string[]
    vars?: {
        SCOPE?: string
        COMPONENT?: string
        ELEMENT?: string
        EXTEND?: string
        BUFFER?: string
        LAYOUT?: string
        BLOCKS?: string
        MACRO?: string
        SAFE?: string
    }
    token?: {
        start?: string
        end?: string
        regex?: string
    }
}

declare type configure = <T extends ejsConfig>(options?: T) => ejsConfig & T
declare type compile = (content: string, path: string) => Function
declare type createContext = (data: { [p: string]: any }) => ContextScope
declare type render = (
    name: string,
    data?: { [x: string]: any },
) => Promise<string>
declare type require = (name: string) => Promise<{ [x: string]: any }>
declare type preload = (list: { [p: string]: any }) => void
declare type helpers = (extendMethods: { [p: string]: any }) => void
declare type create = (config: ejsConfig) => /*elided*/ any

export const configure: configure
export const createContext: createContext
export const render: render
export const require: require
export const preload: preload
export const helpers: helpers
export const compile: compile

export function create(config: ejsConfig): {
    configure: configure
    create: create
    createContext: createContext
    render: render
    require: require
    preload: preload
    compile: compile
    helpers: helpers
}
