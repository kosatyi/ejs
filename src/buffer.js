import { TemplateSyntaxError } from './error.js'

function resolve(list) {
    return Promise.all(list || [])
        .then((list) => list.join(''))
        .catch((e) => e)
}

function reject(error) {
    return Promise.reject(new TemplateSyntaxError(error.message))
}

/**
 *
 * @return {buffer}
 */
export function createBuffer() {
    let store = [],
        array = [],
        error = []

    const buffer = (value) => {
        array.push(value)
    }

    buffer.start = () => {
        error = []
        array = []
    }
    buffer.backup = () => {
        store.push(array.concat())
        array = []
    }
    buffer.restore = () => {
        const result = array.concat()
        array = store.pop()
        return resolve(result)
    }
    buffer.error = (e) => {
        return reject(e)
    }
    buffer.end = () => {
        return resolve(array)
    }
    return buffer
}
