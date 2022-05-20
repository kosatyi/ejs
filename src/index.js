const defaults = require('./defaults')
const { extend, safeValue } = require('./utils')
const ConfigureCompiler = require('./compiler')
const ConfigureScope = require('./scope')
const ConfigureTemplate = require('./template')
const ConfigureWrapper = require('./wrapper')

function configure(options) {
    //
    options = options || {}
    //
    const token = extend({}, defaults.token, options.token)
    const tags = extend({}, defaults.tags, options.tags)
    const loader = extend({}, defaults.loader, options.loader)
    const vars = extend({}, defaults.vars, options.vars)
    const extension = extend({}, defaults.extension, options.extension)
    //
    const Scope = ConfigureScope(vars)
    const Compiler = ConfigureCompiler(token, tags, vars)
    const Template = ConfigureTemplate(loader, extension)
    const Wrapper = ConfigureWrapper(loader)

    const ejs = {}

    //
    function view(name) {
        const template = Template(name)
        const output = (scope) => {
            return template.call(scope, scope, safeValue)
        }
        return {
            render(data = {}) {
                const scope = new Scope(data)
                const content = output(scope)
                if (scope.getExtend()) {
                    scope.setExtend(false)
                    const layout = scope.getLayout()
                    const data = scope.clone()
                    return view(layout).render(data)
                }
                return content
            },
            require() {
                const scope = new Scope({ exports: {} })
                scope.module = scope
                output(scope)
                return scope.exports
            },
        }
    }

    ejs.view = view

    ejs.compile = Compiler

    ejs.wrapper = Wrapper

    ejs.helpers = function (methods) {
        extend(Scope.prototype, methods || {})
    }

    ejs.helpers({
        /**
         * @memberOf window
         * @param name
         * @param data
         * @param cx
         * @return {*}
         */
        include(name, data = {}, cx = true) {
            return view(name).render(extend(cx ? this.clone(true) : {}, data))
        },
        /**
         * @memberOf window
         * @param name
         * @return {{}}
         */
        require(name) {
            return view(name).require()
        },
    })

    return ejs
}

const ejs = configure({})

ejs.configure = configure

module.exports = ejs
