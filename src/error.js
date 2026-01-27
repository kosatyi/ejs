export function TemplateError(reason) {
    Error.call(this,reason);
}
Object.setPrototypeOf(TemplateError.prototype, Error.prototype)
Object.assign(TemplateError.prototype, {
    code: 0,
    getCode() {
        return this.code
    },
    getMessage() {
        return this.message
    },
    toString() {
        return this.getMessage()
    },
})

export function TemplateNotFound(reason) {
    TemplateError.call(this,reason)
}
Object.setPrototypeOf(TemplateNotFound.prototype, TemplateError.prototype)
Object.assign(TemplateNotFound.prototype, { code: 404 })

export function TemplateSyntaxError(reason) {
    TemplateError.call(this,reason)
}
Object.setPrototypeOf(TemplateSyntaxError.prototype, TemplateError.prototype)
Object.assign(TemplateSyntaxError.prototype, { code: 500 })
