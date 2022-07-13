const resolve = (list) => Promise.all(list).then((list) => list.join(''))
/**
 *
 * @return {function}
 */
const Buffer = () => {
    let store = [],
        array = []
    function buffer(value) {
        array.push(value)
    }
    buffer.start = function () {
        array = []
    }
    buffer.backup = function () {
        store.push(array.concat())
        array = []
    }
    buffer.restore = function () {
        const result = array.concat()
        array = store.pop()
        return resolve(result)
    }
    buffer.end = function () {
        return resolve(array)
    }
    return buffer
}

export default Buffer
