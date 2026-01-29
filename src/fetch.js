import { joinPath } from './utils.js'
import { TemplateError, TemplateNotFound } from './error.js'
export const httpRequest = (path, template) => {
    return fetch(joinPath(path, template)).then(
        (response) => {
            if (response.ok) return response.text()
            throw new TemplateNotFound(
                `template ${path} / ${template} not found`,
            )
        },
        (reason) => {
            return new TemplateError(reason)
        },
    )
}
