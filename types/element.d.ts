export function escapeValue(value: string, escape?: boolean): string | any

export function element(
    tag: string,
    attrs?: {
        [x: string]: any
    },
    content?: string[] | string,
): string

declare global {
    export interface ejsElement extends Window {
        element: typeof element
        escapeValue: typeof escapeValue
    }
    const ejsElement: ejsElement
}
