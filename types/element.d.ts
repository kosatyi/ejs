export function safeValue(value: string, escape?: boolean): string | any

export function element(
    tag: string,
    attrs?: {
        [x: string]: any
    },
    content?: string[] | string,
): string
