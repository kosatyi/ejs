import { TemplateSyntaxError } from './error.js'

const resolve = (list) => {
    return Promise.all(list || [])
        .then((list) => list.join(''))
        .catch((e) => e)
}

const reject = (error) => {
    return Promise.reject(new TemplateSyntaxError(error))
}

export const EjsBuffer = () => {
    let store = []
    let array = []
    /**
     *
     * @param value
     * @constructor
     */
    const EjsBuffer = (value) => {
        array.push(value)
    }
    EjsBuffer.start = () => {
        array = []
    }
    EjsBuffer.backup = () => {
        store.push(array.concat())
        array = []
    }
    EjsBuffer.restore = () => {
        const result = array.concat()
        array = store.pop()
        return resolve(result)
    }
    EjsBuffer.error = (e, filename) => {
        return reject(e, filename)
    }
    EjsBuffer.end = () => {
        return resolve(array)
    }
    return EjsBuffer
}
