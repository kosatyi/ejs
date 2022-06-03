/**
 *
 * @param {{}} config
 * @constructor
 */
function Wrapper(config) {
    this.name = config.export
}

/**
 *
 * @type {{browser(*): string}}
 */
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
