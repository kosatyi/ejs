export class TemplateError extends Error {
    code
    new(message: string): TemplateError
    toString(): string
    getCode(): number
}

export class TemplateNotFound extends TemplateError {
    code: 404
}

export class TemplateSyntaxError extends TemplateError {
    code: 500
}
