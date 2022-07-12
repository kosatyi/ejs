function Wrapper(config) {
    this.configure(config)
}

Wrapper.prototype = {
    configure(config) {
        this.name = config.export
    },
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

export default Wrapper
