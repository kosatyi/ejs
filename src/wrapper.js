function configure(loader) {
    const name = loader.precompiled
    function Wrapper(list) {
        let out = '(function(o){\n'
        list.forEach((item) => {
            out +=
                'o[' +
                JSON.stringify(item.name) +
                ']=' +
                String(item.content) +
                '\n'
        })
        out += '})(window.' + name + ' = window.' + name + ' || {});\n'
        return out
    }
    return Wrapper
}

module.exports = configure
