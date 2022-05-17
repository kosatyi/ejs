const Output = () => {
    let backup = ''
    let string = ''
    let result = ''
    const buffer = (value) => {
        string += value
    }
    buffer.toString = () => {
        result = ''
        backup = ''
        return string
    }
    buffer.backup = () => {
        backup = string + ''
        string = ''
    }
    buffer.clear = () => {
        string = ''
    }
    buffer.restore = () => {
        result = string + ''
        string = backup + ''
        backup = ''
        return result
    }
    return buffer
}

export { Output }
