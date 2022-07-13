const Wrapper = (config) => {
    const name = config.export
    return function (list) {
        let out = '(function(o){\n'
        list.forEach((item) => {
            out +=
                'o[' +
                JSON.stringify(item.name) +
                ']=' +
                String(item.content) +
                '\n'
        })
        out += '})(window["' + name + '"] = window["' + name + '"] || {});\n'
        return out
    }
}

export default Wrapper
