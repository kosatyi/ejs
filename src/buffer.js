import { error } from './error.js'

const resolve = (list) => {
    return Promise.all(list || [])
        .then((list) => list.join(''))
        .catch((e) => {
            return error(500, e)
        })
}

const reject = (e) => {
    return Promise.reject(error(500, e))
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
    EjsBuffer.error = (e) => {
        return reject(e)
    }
    EjsBuffer.end = () => {
        return resolve(array)
    }
    return EjsBuffer
}
