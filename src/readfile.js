import fs from 'fs'
import { joinPath } from './utils.js'

export function readFile(path, template) {
    return new Promise((resolve, reject) => {
        fs.readFile(joinPath(path, template), (error, data) => {
            if (error) {
                reject(error)
            } else {
                resolve(data.toString())
            }
        })
    })
}
