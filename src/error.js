export function TemplateError(message) {
    this.code = 1
    this.name = 'TemplateError'
    this.message = message
    Error.call(this)
}
Object.setPrototypeOf(TemplateNotFound.prototype, Error.prototype)

export function TemplateNotFound(message) {
    TemplateError.call(this)
    this.code = 404
    this.name = 'TemplateNotFound'
    this.message = message
}

Object.setPrototypeOf(TemplateNotFound.prototype, TemplateError.prototype)

export function TemplateSyntaxError(message) {
    TemplateError.call(this)
    this.code = 500
    this.name = 'TemplateSyntaxError'
    this.message = message
}

Object.setPrototypeOf(TemplateSyntaxError.prototype, TemplateError.prototype)
