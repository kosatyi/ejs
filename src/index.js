import { config } from './config'
import { extend, uuid, random, hasProp, entities, safeValue } from './utils'
import { node } from './node'
import { compile } from './compile'
import { wrapper } from './wrapper'
import { Scope, helpers } from './scope'

const extMissing = (value) => {
    return config.get('extension.supported').indexOf(value) === -1
}

const getPrecompiledTemplates = () => {
    let list = {}
    let prop = config.get('export')
    if (hasProp(window, prop)) {
        list = window[prop]
    }
    return list
}

const getTemplate = (name) => {
    const list = getPrecompiledTemplates()
    const ext = name.split('.').pop()
    if (name.charAt(0) === '/') {
        name = name.slice(1)
    }
    if (extMissing(ext)) {
        name = [name, config.get('extension.default')].join('.')
    }
    if (hasProp(list, name)) {
        return list[name]
    }
    const id = uuid(name)
    if (hasProp(list, id)) {
        return list[id]
    }
    return (list[id] = compile(name, '.ejs'))
}

/**
 *
 * @param name
 * @return {any|{require(): any, render(*): (*)}}
 */

const view = (name) => {
    const template = getTemplate(name)
    /**
     *
     * @param {Object<Scope>} scope
     * @return {*}
     */
    const render = (scope) => {
        return template.call(scope, scope, scope.getOutput(), safeValue)
    }
    return {
        /**
         *
         * @param {Object} data
         * @return {*}
         */
        render(data) {
            const scope = new Scope(data)
            const content = render(scope)
            if (scope.hasExtend()) {
                return view(scope.getLayout()).render(scope.clone())
            }
            return content
        },
        /**
         *
         * @return {any}
         */
        require() {
            const scope = new Scope({ exports: {} })
            scope.module = scope
            render(scope)
            return scope.exports
        },
    }
}

helpers({
    /**
     * @memberOf window
     * @param name
     * @param data
     * @param with_context
     * @return {*}
     */
    include(name, data = {}, with_context = true) {
        return view(name).render(extend({}, with_context ? this : {}, data))
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

helpers({
    /**
     * @memberOf window
     * @param tag
     * @param attrs
     * @param content
     */
    node(tag, attrs, content) {
        return node(tag, attrs, content)
    },
    /**
     * @memberOf window
     * @param size
     */
    random(size) {
        return random(size)
    },
    /**
     * @memberOf window
     * @param str
     */
    uuid(str) {
        return uuid(str)
    },
})

export { config, node, uuid, random, entities, compile, wrapper, helpers, view }
