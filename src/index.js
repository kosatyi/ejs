const defaults = require('./defaults')
const { extend, safeValue, hasProp } = require('./utils')

const ConfigureScope = require('./scope')
const Compiler = require('./compiler')
const Wrapper = require('./wrapper')
const Loader = require('./loader')

function configure(options) {
    // Default
    options = options || {}
    //
    const config = {
        extension: {},
        loader: {},
        token: {},
        vars: {},
    }
    extend(config.token, defaults.token, options.token)
    extend(config.loader, defaults.loader, options.loader)
    extend(config.vars, defaults.vars, options.vars)
    extend(config.extension, defaults.extension, options.extension)
    //
    const compiler = new Compiler(config.token, config.vars, config.extension)
    const wrapper = new Wrapper(config.loader)
    const loader = new Loader(config.loader, config.extension)
    //
    const Scope = ConfigureScope(config.vars)
    //
    const cache = {}
    //
    function output(path, scope) {
        let template
        if (hasProp(cache, path) === false) {
            let text = loader.fetch(path)
            template = compiler.compile(text, path)
            cache[path] = template
        } else {
            template = cache[path]
        }
        return template.call(scope, scope, safeValue, scope.getBuffer())
    }
    //
    function render(path, data) {
        const scope = new Scope(data)
        const content = output(path, scope)
        if (scope.getExtend()) {
            scope.setExtend(false)
            const layout = scope.getLayout()
            const data = scope.clone()
            return render(layout, data)
        }
        return content
    }
    /**
     * @memberOf window
     * @name require
     * @param {String} path
     * @return {{}}
     */
    function require(path) {
        this.exports = this.exports || {}
        this.module = this
        output(path, this)
        return this.exports
    }
    /**
     * @memberOf window
     * @param name
     * @param data
     * @param cx
     * @return {*}
     */
    function include(name, data = {}, cx = true) {
        return render(name, extend(cx ? this.clone(true) : {}, data))
    }
    /**
     * @memberOf window
     */
    const ejs = {
        render: render,
        compile(text, path) {
            return compiler.compile(text, path)
        },
        wrapper(list) {
            return wrapper.browser(list)
        },
        helpers(methods) {
            extend(Scope.prototype, methods || {})
        },
        precompiled(list) {},
    }
    ejs.helpers({
        include,
        require,
    })
    ejs.configure = configure
    return ejs
}

module.exports = configure({})
