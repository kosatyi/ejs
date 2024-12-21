/**
 * @extends Error
 * @property code
 * @param {string} message
 * @constructor
 */
export function TemplateError(message) {
    this.name = 'TemplateError'
    this.message = message
    Error.call(this)
}

/**
 *
 */
Object.setPrototypeOf(TemplateError.prototype, Error.prototype)
Object.assign(TemplateError.prototype, {  code: 1 })
/**
 *
 * @return {number}
 */
TemplateError.prototype.getCode = function() {
    return this.code
}
/**
 *
 * @return {string}
 */
TemplateError.prototype.getMessage = function() {
    return this.message
}
/**
 * @return {string}
 */
TemplateError.prototype.toString = function() {
    return this.getMessage()
}

/**
 * @extends TemplateError
 * @param {string} message
 * @constructor
 */
export function TemplateNotFound(message) {
    TemplateError.call(this)
    this.name = 'TemplateNotFound'
    this.message = message
}

/**
 *
 */
Object.setPrototypeOf(TemplateNotFound.prototype, TemplateError.prototype)
Object.assign(TemplateNotFound.prototype, {  code: 404 })
/**
 * @extends TemplateError
 * @param {string} message
 * @constructor
 */
export function TemplateSyntaxError(message) {
    TemplateError.call(this)
    this.name = 'TemplateSyntaxError'
    this.message = message
}

/**
 *
 */
Object.setPrototypeOf(TemplateSyntaxError.prototype, TemplateError.prototype)
Object.assign(TemplateSyntaxError.prototype, {  code: 500 })
