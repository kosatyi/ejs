import { joinPath } from './utils.js'
import { TemplateError } from './error.js'
export const httpRequest = (path, template) => {
    return fetch(joinPath(path, template)).then(
        (response) => response.text(),
        (reason) => new TemplateError(reason),
    )
}
