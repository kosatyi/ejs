const defaults = require('./defaults')
const { extend, safeValue } = require('./utils')
const ConfigureScope = require('./scope')
const ConfigureExpress = require('./express')
const Compiler = require('./compiler')
const Wrapper = require('./wrapper')
const Loader = require('./loader')
const Cache = require('./cache')

function configure(options) {
    const config = extend(
        {
            loader: {},
            extension: {},
            token: {},
            vars: {},
        },
        defaults,
        options || {}
    )
    //
    const compiler = new Compiler(config)
    const wrapper = new Wrapper(config)
    const cache = new Cache(config)
    const loader = new Loader(cache, compiler, config)
    //
    const Scope = ConfigureScope(config)

    //
    function template(path, defaultExt) {
        const ext = path.split('.').pop()
        if (config.extension.supported.indexOf(ext) === -1) {
            path = [path, defaultExt].join('.')
        }
        return path
    }
    //
    function output(path, scope) {
        return loader.get(path).then(function (template) {
            return template.call(scope, scope, scope.getBuffer(), safeValue)
        })
    }
    //
    function render(path, data) {
        const view = template(path, config.extension.default)
        const scope = new Scope(data)
        return output(view, scope).then(function (content) {
            if (scope.getExtend()) {
                scope.setExtend(false)
                const layout = scope.getLayout()
                const data = scope.clone()
                return render(layout, data)
            }
            return content
        })
    }
    //
    function require(path) {
        const view = template(path, config.extension.module)
        this.exports = {}
        this.module = this
        return output(view, this).then(
            function () {
                return this.exports
            }.bind(this)
        )
    }
    //
    function __express(path, options, fn) {
        if (typeof options === 'function') {
            fn = options
            options = {}
        }
        options = options || {}
        const settings = options.settings || {} // Mixin any options provided to the express app.
        console.log(path, options, fn)
        return fn(null, 'test content')
    }
    //
    extend(Scope.prototype, {
        /**
         * @memberOf global
         * @param {string} path
         * @return {string|{}}
         */
        require: require,
        /**
         * @memberOf global
         * @param {string} path
         * @return {string|{}}
         */
        render: render,
    })

    /**
     * @memberOf global
     */
    return {
        cache,
        /**
         *
         * @param path
         * @param data
         * @return {*}
         */
        render: render,
        /**
         *
         * @param text
         * @param path
         * @return {Function}
         */
        compile(text, path) {
            return compiler.compile(text, path)
        },
        /**
         *
         * @param list
         * @return {string}
         */
        wrapper(list) {
            return wrapper.browser(list)
        },
        /**
         *
         * @param methods
         */
        helpers(methods) {
            extend(Scope.prototype, methods || {})
        },
        /**
         *  Configure EJS
         */
        configure: configure,
        /**
         *
         */
        express(app) {
            app.set('view', ConfigureExpress(this))
        },
    }
}

module.exports = configure({})
