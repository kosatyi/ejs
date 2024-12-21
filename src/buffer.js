import { TemplateSyntaxError } from './error.js'

function resolve(list) {
    return Promise.all(list || []).then((list) => list.join('')).catch((e) => e)
}

function reject(error) {
    return Promise.reject(new TemplateSyntaxError(error.message))
}

export function createBuffer() {
    let store = [],
        array = [],
        error = []

    function buffer(value) {
        array.push(value)
    }

    buffer.start = function() {
        error = []
        array = []
    }
    buffer.backup = function() {
        store.push(array.concat())
        array = []
    }
    buffer.restore = function() {
        const result = array.concat()
        array = store.pop()
        return resolve(result)
    }
    buffer.error = function(e) {
        return reject(e)
    }
    buffer.end = function() {
        return resolve(array)
    }
    return buffer
}
