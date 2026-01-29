export function TemplateError(message) {
    this.message = message
    this.stack = new Error().stack
}
TemplateError.prototype = new Error()
Object.assign(TemplateError.prototype, {
    code: 0,
})

export function TemplateNotFound(reason) {
    TemplateError.call(this, String(reason))
}
Object.setPrototypeOf(TemplateNotFound.prototype, TemplateError.prototype)
Object.assign(TemplateNotFound.prototype, {
    name: 'TemplateNotFound',
    code: 404,
})

export function TemplateSyntaxError(reason) {
    TemplateError.call(this, reason)
}
Object.setPrototypeOf(TemplateSyntaxError.prototype, TemplateError.prototype)
Object.assign(TemplateSyntaxError.prototype, {
    name: 'TemplateSyntaxError',
    code: 500,
})
