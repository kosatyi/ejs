import { joinPath } from './utils.js'

export const httpRequest = (path, template, error) => {
    return fetch(joinPath(path, template)).then(
        (response) => {
            if (response.ok) return response.text()
            return error(404, `template ${template} not found`)
        },
        (reason) => error(500, reason),
    )
}
