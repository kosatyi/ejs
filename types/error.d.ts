export class TemplateError extends Error {
    new(message: string): TemplateError
    code: number | 0
    getCode(): number
    getMessage(): string
    toString(): string
}

export class TemplateNotFound extends TemplateError {
    code: 404
}

export class TemplateSyntaxError extends TemplateError {
    code: 500
}
