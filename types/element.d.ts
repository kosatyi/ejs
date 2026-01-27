export function element(
    tag: string,
    attrs?: {
        [x: string]: any
    },
    content?: string[] | string,
): string

export function safeValue(value: string, escape?: boolean): string | any
