import fs from 'node:fs/promises'
import { joinPath } from './utils.js'

export const readFile = (path, template) => {
    return fs
        .readFile(joinPath(path, template))
        .then((contents) => contents.toString())
        .then((text) => String(text))
}
