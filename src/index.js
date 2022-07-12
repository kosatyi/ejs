import path from 'path'
import defaults from './defaults'
import { extend, safeValue } from './utils'
import { isFunction } from './type'
import ConfigureScope from './scope'
import Compiler from './compiler'
import Wrapper from './wrapper'
import Loader from './loader'

function configure(options) {
    /**
     * @extends defaults
     */
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
    const Scope = ConfigureScope(config)
    //
    const compiler = new Compiler(config)
    const wrapper = new Wrapper(config)
    const loader = new Loader(config, compiler)
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
    function render(name, data) {
        const view = template(name, config.extension.default)
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
    function require(name) {
        const view = template(name, config.extension.module)
        this.exports = {}
        this.module = this
        return output(view, this).then(
            function () {
                return this.exports
            }.bind(this)
        )
    }
    //
    let expressInstance = null
    //
    function express(name, options, callback) {
        if (isFunction(options)) {
            callback = options
            options = {}
        }
        options = options || {}
        const settings = options.settings || {}
        const viewPath = settings['views']
        const viewOptions = settings['view options'] || {}
        const filename = path.relative(viewPath, name)
        if (expressInstance === null) {
            expressInstance = configure(viewOptions)
        }
        return expressInstance
            .render(filename, options)
            .then(function (content) {
                callback(null, content)
            })
            .catch(function (error) {
                callback(error)
            })
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
        __express: express,
    }
}

export default configure({})
