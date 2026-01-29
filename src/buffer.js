import { TemplateSyntaxError } from './error.js'

const resolve = (list) => {
    return Promise.all(list || [])
        .then((list) => list.join(''))
        .catch((e) => e)
}
const reject = (error) => {
    console.log(error.message)
    return Promise.reject(new TemplateSyntaxError(error.message))
}

export const createBuffer = () => {
    let store = [],
        array = []
    /**
     * @name buffer
     * @param value
     */
    const buffer = (value) => {
        array.push(value)
    }
    buffer.start = () => {
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
