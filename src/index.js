import {compile, entities, safe, wrapper} from './view'
import {node} from './node'

/**
 * @with helper
 * @type {{}}
 */

function Scope(data) {
    extend(this, data || {});
}

Scope.prototype = {};

const uuid = str => {
    let i = str.length
    let hash1 = 5381
    let hash2 = 52711
    while (i--) {
        const char = str.charCodeAt(i)
        hash1 = (hash1 * 33) ^ char
        hash2 = (hash2 * 33) ^ char
    }
    return (hash1 >>> 0) * 4096 + (hash2 >>> 0)
}

const random = size => {
    let string = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
    let limit = chars.length;
    let length = size || 10;
    for (let i = 0; i < length; i++) {
        string += chars.charAt(Math.floor(Math.random() * limit));
    }
    return string;
}

const extend = (target, ...sources) => {
    return Object.assign(target, ...sources.filter(i => i));
}

const getPrecompiledTemplates = () => {
    let list = {};
    let prop = window['EJS_PRECOMPILED_VAR'] || 'ejsPrecompiled';
    if (hasProp(window, prop)) {
        list = window[prop];
    }
    return list;
}

const extList = ['ejs', 'mjs', 'html', 'svg', 'css', 'js'];
const extDefault = 'ejs';

const extMissing = (value) => {
    return (window['EJS_EXT_LIST'] || extList).indexOf(value) === -1;
}

const getTemplate = (name) => {
    const list = getPrecompiledTemplates();
    const ext = name.split('.').pop();
    if (name.charAt(0) === '/') {
        name = name.slice(1);
    }
    if (extMissing(ext)) {
        name = [name,extDefault].join('.');
    }
    if (hasProp(list, name)) {
        return list[name];
    }
    const id = uuid(name);
    if (hasProp(list, id)) {
        return list[id];
    }
    return list[id] = compile(name, '.ejs');
}

const view = (name) => {
    const template = getTemplate(name);
    return {
        render(data) {
            const scope = new Scope(data);
            return template.call(scope, scope, safe);
        },
        require() {
            const scope = new Scope({exports: {}});
            scope.module = scope;
            template.call(scope, scope, safe);
            return scope.exports;
        }
    }
}

const helpers = (methods) => {
    extend(Scope.prototype, methods);
}

const hasProp = (object, prop) => object.hasOwnProperty(prop);

const getPath = (context, name) => {
    let data = context;
    let chunk = name.split('.');
    let prop = chunk.pop();
    chunk.forEach(part => {
        data = data[part] = data[part] || {}
    });
    return [data, prop];
}

helpers({
    /**
     * @memberOf window
     * @param name
     * @param defaults
     */
    get(name, defaults) {
        const [result, prop] = getPath(this, name);
        return hasProp(result, prop) ? result[prop] : defaults;
    },
    /**
     * @memberOf window
     * @param name
     * @param value
     */
    set(name, value) {
        const [result, prop] = getPath(this, name);
        result[prop] = value;
    },
    /**
     * @memberOf window
     * @param object
     * @param callback
     */
    each(object, callback) {
        let prop;
        for (prop in object) {
            if (object.hasOwnProperty(prop)) {
                callback.call(this, object[prop], prop, object);
            }
        }
    },
    /**
     * @memberOf window
     * @param name
     * @param args
     */
    call(name, ...args) {
        const [result, prop] = getPath(this, name);
        if (typeof (result[prop]) === 'function') {
            return result[prop](...args);
        }
    },
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
    /**
     * @memberOf window
     * @param name
     * @param data
     * @return {*}
     */
    include(name, data) {
        return view(name).render(extend({}, this, data || {}));
    },
    /**
     * @memberOf window
     * @param name
     * @param data
     * @return {*}
     */
    macro(name, data) {
        return view(['macro', name].join('/')).render(extend({}, data || {}));
    },
    /**
     * @memberOf window
     * @param name
     * @param path
     * @return {*}
     */
    importMacro(name, path) {
        this.set(name, p => this.macro(path, p));
    },
    /**
     * @memberOf window
     * @param name
     * @return {{}}
     */
    require(name) {
        return view(name).require();
    }
});


export {
    node,
    uuid,
    random,
    entities,
    compile,
    wrapper,
    helpers,
    view
}
