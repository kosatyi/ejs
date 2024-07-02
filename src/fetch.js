import { joinPath } from './utils.js'

export const httpRequest = (path, template) => {
    return fetch(joinPath(path, template)).then(
        (response) => response.text(),
        (reason) => String(reason)
    )
}
