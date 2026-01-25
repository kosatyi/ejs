/**
 *
 * @constructor
 */
export function TemplateError(){
    TemplateError.call(this)
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
    }
})

/**
 *
 * @constructor
 */
export function TemplateNotFound(){
    TemplateError.call(this)
}
Object.setPrototypeOf(TemplateNotFound.prototype, TemplateError.prototype)
Object.assign(TemplateNotFound.prototype, { code: 404  })

/**
 *
 * @constructor
 */
export function TemplateSyntaxError(){
    TemplateError.call(this)
}
Object.setPrototypeOf(TemplateSyntaxError.prototype, TemplateError.prototype)
Object.assign(TemplateSyntaxError.prototype, { code: 500  })




