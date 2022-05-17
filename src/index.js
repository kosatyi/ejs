import { node } from './node'
import { extend, uuid, random, hasProp, entities, safeValue } from './utils'
import { compile, wrapper } from './view'
import { Scope, helpers } from './scope'

const getPrecompiledTemplates = () => {
    let list = {}
    let prop = window['EJS_PRECOMPILED_VAR'] || 'ejsPrecompiled'
    if (hasProp(window, prop)) {
        list = window[prop]
    }
    return list
}

const extList = ['ejs', 'mjs', 'html', 'svg', 'css', 'js']
const extDefault = 'ejs'

const extMissing = (value) => {
    return (window['EJS_EXT_LIST'] || extList).indexOf(value) === -1
}

const getTemplate = (name) => {
    const list = getPrecompiledTemplates()
    const ext = name.split('.').pop()
    if (name.charAt(0) === '/') {
        name = name.slice(1)
    }
    if (extMissing(ext)) {
        name = [name, extDefault].join('.')
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

const view = (name) => {
    const template = getTemplate(name)
    return {
        render(data) {
            const scope = new Scope(data)
            const content = template.call(scope, scope, safeValue)
            if (scope.getLayout()) {
                return view(scope.getLayout()).render(scope)
            }
            return content
        },
        require() {
            const scope = new Scope({ exports: {} })
            scope.module = scope
            template.call(scope, scope, safeValue)
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
    node,
    /**
     * @memberOf window
     * @param size
     */
    random,
    /**
     * @memberOf window
     * @param prefix
     */
    uuid,
})

export { node, uuid, random, entities, compile, wrapper, helpers, view }
