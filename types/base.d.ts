import { EJS } from './ejs'

export function create(config: any): {
    configure: <T extends { [p: string]: any }>(options?: T) => T;
    create: (config: any) => /*elided*/ any;
    createContext: (data: {
        [p: string]: any;
    }) => EJS;
    render: (name: string, data?: {
        [x: string]: any;
    }) => Promise<string>;
    require: (name: string) => Promise<{
        [x: string]: any;
    }>;
    preload: (list: {
        [p: string]: any;
    }) => void;
    compile: (content: string, path: string) => Function;
    helpers: (extendMethods: {
        [p: string]: any;
    }) => void;
};

export function configure<T extends { [p: string]: any }>(options?: T): T;

export function compile(content: string, path: string): Function;

export function createContext(data: {
    [p: string]: any;
}): EJS;

export function render(name: string, data?: {
    [x: string]: any;
}): Promise<string>;

export function require(name: string): Promise<{
    [x: string]: any;
}>;

export function preload(list: {
    [p: string]: any;
}): void

export function compile(list: {
    [p: string]: any;
}): void

export function helpers(extendMethods: {
    [p: string]: any;
}): void;

export function preload(list: {
    [p: string]: any;
}): void;
