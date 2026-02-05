import fs from 'node:fs/promises'
import { joinPath } from './utils.js'

export const readFile = (path, template, error) => {
    return fs
        .readFile(joinPath(path, template))
        .then((contents) => contents.toString())
        .catch((reason) => {
            if (reason.code === 'ENOENT') {
                error(404, `template ${template} not found`)
            } else {
                error(500, reason)
            }
        })
}
