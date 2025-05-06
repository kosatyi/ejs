export class TemplateError extends Error {
    code = 0
    constructor(message) {
        super()
        this.message = message
    }
    getCode() {
        return this.code
    }
    getMessage() {
        return this.message
    }
    toString() {
        return this.getMessage()
    }
}

export class TemplateNotFound extends TemplateError {
    code = 404
}

export class TemplateSyntaxError extends TemplateError {
    code = 500
}
