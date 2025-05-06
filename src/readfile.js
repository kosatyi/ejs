import fs from 'node:fs'
import { joinPath } from './utils.js'
import { TemplateError } from './error.js'

export function readFile(path, template) {
    return new Promise((resolve, reject) => {
        fs.readFile(joinPath(path, template), (error, data) => {
            if (error) {
                reject(new TemplateError(error))
            } else {
                resolve(data.toString())
            }
        })
    })
}
