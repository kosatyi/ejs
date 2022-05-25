function Wrapper(loader) {
    this.name = loader.export
}

Wrapper.prototype = {
    browser(list) {
        let name = this.name
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
    },
}

module.exports = Wrapper
