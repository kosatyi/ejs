export class TemplateError extends Error {
    name = 'TemplateError'
    constructor(error) {
        super(error)
        if (error instanceof Error) {
            this.stack = error.stack
            this.filename = error.filename
            this.lineno = error.lineno
        }
    }
}

export class TemplateNotFound extends TemplateError {
    name = 'TemplateNotFound'
    code = 404
}

export class TemplateSyntaxError extends TemplateError {
    name = 'TemplateSyntaxError'
    code = 500
}
