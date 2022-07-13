import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';

const defaults = {};

defaults.export = 'ejs.precompiled';
defaults.path = 'views';
defaults.resolver = null;

defaults.extension = {
    supported: ['ejs', 'js', 'html', 'svg', 'css'],
    default: 'ejs',
    module: 'js',
};

defaults.vars = {
    EXTEND: '$$$',
    BUFFER: '$$a',
    OUTPUT: '$$i',
    LAYOUT: '$$l',
    MACROS: '$$m',
    PRINT: '$$j',
    BLOCKS: '$$b',
    ERROR: '$$e',
    SCOPE: '$$s',
    SAFE: '$$v',
};

defaults.token = {
    start: '<%',
    end: '%>',
    regex: '([\\s\\S]+?)',
};

const typeProp = function () {
    const args = [].slice.call(arguments);
    const callback = args.shift();
    return args.filter(callback).pop()
};

const isFunction = (v) => typeof v === 'function';
const isString = (v) => typeof v === 'string';

const isNode = new Function(
    'try {return this===global;}catch(e){return false;}'
);

const symbolEntities = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029',
};

const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
};

const regexKeys = (obj) =>
    new RegExp(['[', Object.keys(obj).join(''), ']'].join(''), 'g');

const htmlEntitiesMatch = regexKeys(htmlEntities);

const symbolEntitiesMatch = regexKeys(symbolEntities);

const entities = (string = '') => {
    return ('' + string).replace(
        htmlEntitiesMatch,
        (match) => htmlEntities[match]
    )
};

const symbols = (string) => {
    return ('' + string).replace(
        symbolEntitiesMatch,
        (match) => '\\' + symbolEntities[match]
    )
};

const safeValue = (value, escape, check) => {
    return (check = value) == null ? '' : escape ? entities(check) : check
};

const getPath = (context, name) => {
    let data = context;
    let chunk = name.split('.');
    let prop = chunk.pop();
    chunk.forEach((part) => {
        data = data[part] = data[part] || {};
    });
    return [data, prop]
};

const extend = (...args) => {
    const target = args.shift();
    return args
        .filter((source) => source)
        .reduce((target, source) => {
            return Object.assign(target, source)
        }, target)
};

const noop = () => {};

const each = (object, callback, context) => {
    let prop;
    for (prop in object) {
        if (hasProp(object, prop)) {
            callback.call(context || null, object[prop], prop, object);
        }
    }
};

const map = (object, callback, context) => {
    const result = [];
    each(
        object,
        (value, key, object) => {
            let item = callback.call(value, key, object);
            if (item !== undefined) {
                result.push(item);
            }
        },
        context
    );
    return result
};

const filter = (object, callback, context) => {
    const isArray = object instanceof Array;
    const result = isArray ? [] : {};
    each(
        object,
        (value, key, object) => {
            let item = callback(value, key, object);
            if (item !== undefined) {
                if (isArray) {
                    result.push(item);
                } else {
                    result[key] = item;
                }
            }
        },
        context
    );
    return result
};

const omit = (object, list) => {
    return filter(object, (value, key) => {
        if (list.indexOf(key) === -1) {
            return value
        }
    })
};

const hasProp = (object, prop) => {
    return object && object.hasOwnProperty(prop)
};

const tags = [
    {
        symbol: '-',
        format(value) {
            return `'+\n${this.SAFE}(${value},1)+\n'`
        },
    },
    {
        symbol: '=',
        format(value) {
            return `'+\n${this.SAFE}(${value})+\n'`
        },
    },
    {
        symbol: '#',
        format(value) {
            return `'+\n/**${value}**/+\n'`
        },
    },
    {
        symbol: '',
        format(value) {
            return `')\n${value}\n${this.BUFFER}('`
        },
    },
];

const match = (regex, text, callback) => {
    let index = 0;
    text.replace(regex, function () {
        const params = [].slice.call(arguments, 0, -1);
        const offset = params.pop();
        const match = params.shift();
        callback(params, index, offset);
        index = offset + match.length;
        return match
    });
};

const Compiler = (config) => {
    const token = config.token;
    const vars = config.vars;
    const module = config.extension.module;
    const matches = [];
    const formats = [];
    tags.forEach((item) => {
        matches.push(
            token.start
                .concat(item.symbol)
                .concat(token.regex)
                .concat(token.end)
        );
        formats.push(item.format.bind(vars));
    });
    const regex = new RegExp(matches.join('|').concat('|$'), 'g');
    /**
     * @type Function
     * @name Compile
     */
    return function (content, path) {
        const { SCOPE, SAFE, BUFFER } = vars;
        const extension = path.split('.').pop();
        if (extension === module) {
            content = [token.start, content, token.end].join('\n');
        }
        let source = `${BUFFER}('`;
        match(regex, content, (params, index, offset) => {
            source += symbols(content.slice(index, offset));
            params.forEach(function (value, index) {
                if (value) source += formats[index](value);
            });
        });
        source += `');`;
        source = `with(${SCOPE}){${source}}`;
        source = `${BUFFER}.start();${source}return ${BUFFER}.end();`;
        source += `\n//# sourceURL=${path}`;
        let result = null;
        try {
            result = new Function(SCOPE, BUFFER, SAFE, source);
            result.source = result.toString();
        } catch (e) {
            e.filename = path;
            e.source = source;
            throw e
        }
        return result
    }
};

const Wrapper = (config) => {
    const name = config.export;
    return function (list) {
        let out = '(function(o){\n';
        list.forEach((item) => {
            out +=
                'o[' +
                JSON.stringify(item.name) +
                ']=' +
                String(item.content) +
                '\n';
        });
        out += '})(window["' + name + '"] = window["' + name + '"] || {});\n';
        return out
    }
};

const HttpRequest = (template) =>
    window.fetch(template).then((response) => response.text());

const FileSystem = (template) =>
    new Promise((resolve, reject) => {
        fs.readFile(template, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.toString());
            }
        });
    });

const Watcher = (path, cache) =>
    chokidar
        .watch('.', {
            cwd: path,
        })
        .on('change', (name) => {
            cache.remove(name);
        })
        .on('error', (error) => {
            console.log('watcher error: ' + error);
        });

const Template = (config, cache, compile) => {
    const path = config.path;
    config.token || {};
    const resolver = isFunction(config.resolver)
        ? config.resolver
        : isNode()
        ? FileSystem
        : HttpRequest;

    const normalize = (template) => {
        template = [path, template].join('/');
        template = template.replace(/\/\//g, '/');
        return template
    };
    const resolve = (template) => {
        return resolver(normalize(template))
    };
    const result = (content, template) => {
        cache.set(template, content);
        return content
    };
    const get = (template) => {
        if (cache.exist(template)) {
            return cache.resolve(template)
        }
        const content = resolve(template).then((content) =>
            result(compile(content, template), template)
        );
        return result(content, template)
    };
    if (config.watch && isNode()) {
        Watcher(path, cache);
    }
    return get
};

const selfClosed = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
];

const space = ' ';
const quote = '"';
const equal = '=';
const slash = '/';
const lt = '<';
const gt = '>';

function element(tag, attrs, content) {
    const result = [];
    const hasClosedTag = selfClosed.indexOf(tag) === -1;
    const attributes = map(attrs, function (value, key) {
        if (value !== null && value !== undefined) {
            return [
                entities(key),
                [quote, entities(value), quote].join(''),
            ].join(equal)
        }
    }).join(space);
    result.push([lt, tag, space, attributes, gt].join(''));
    if (content) {
        result.push(content instanceof Array ? content.join('') : content);
    }
    if (hasClosedTag) {
        result.push([lt, slash, tag, gt].join(''));
    }
    return result.join('')
}

const resolve = (list) => Promise.all(list).then((list) => list.join(''));
/**
 *
 * @return {function}
 */
const Buffer = () => {
    let store = [],
        array = [];
    function buffer(value) {
        array.push(value);
    }
    buffer.start = function () {
        array = [];
    };
    buffer.backup = function () {
        store.push(array.concat());
        array = [];
    };
    buffer.restore = function () {
        const result = array.concat();
        array = store.pop();
        return resolve(result)
    };
    buffer.end = function () {
        return resolve(array)
    };
    return buffer
};

/**
 *
 * @param {{}} instance
 * @method create
 */
const Component = (instance) => {
    const defaults = extend({}, instance.props);
    const create = instance.create;
    return {
        element,
        create,
        render(props) {
            return this.create(extend({}, defaults, props))
        },
    }
};

const Scope = (config, methods) => {
    /**
     *
     */
    const { EXTEND, MACROS, LAYOUT, BLOCKS, BUFFER } = config.vars;
    /**
     *
     * @param data
     * @constructor
     */
    function Scope(data = {}) {
        this.setBlocks();
        extend(this, data);
        this.setBuffer();
        this.setLayout(false);
        this.setExtend(false);
    }

    Object.defineProperties(Scope.prototype, {
        setBuffer: {
            value() {
                Object.defineProperty(this, BUFFER, {
                    value: Buffer(),
                    writable: false,
                    configurable: false,
                });
            },
            writable: false,
            configurable: false,
        },
        getBuffer: {
            value() {
                return this[BUFFER]
            },
            writable: false,
            configurable: false,
        },
        setBlocks: {
            value() {
                Object.defineProperty(this, BLOCKS, {
                    value: {},
                    writable: true,
                    enumerable: true,
                    configurable: false,
                });
            },
            writable: false,
            configurable: false,
        },
        getBlocks: {
            value() {
                return this[BLOCKS]
            },
            writable: false,
            configurable: false,
        },
        setExtend: {
            value(state) {
                Object.defineProperty(this, EXTEND, {
                    value: state,
                    writable: true,
                    configurable: false,
                });
            },
            writable: false,
            configurable: false,
        },
        getExtend: {
            value() {
                return this[EXTEND]
            },
            writable: false,
            configurable: false,
        },
        setLayout: {
            value(layout) {
                Object.defineProperty(this, LAYOUT, {
                    value: layout,
                    writable: true,
                    configurable: false,
                });
            },
            writable: false,
            configurable: false,
        },
        getLayout: {
            value() {
                return this[LAYOUT]
            },
            writable: false,
            configurable: false,
        },
    });

    Scope.helpers = (methods) => {
        extend(Scope.prototype, methods);
    };

    /**
     * @lends Scope.prototype
     */
    Scope.helpers(methods);
    /**
     * @lends Scope.prototype
     */
    Scope.helpers({
        /**
         * @return {*}
         */
        clone(exclude_blocks) {
            const filter = [LAYOUT, EXTEND, MACROS, BUFFER];
            if (exclude_blocks === true) {
                filter.push(BLOCKS);
            }
            return omit(this, filter)
        },
        /**
         * Join values to output buffer
         * @type Function
         */
        echo() {
            const buffer = this.getBuffer();
            const params = [].slice.call(arguments);
            params.forEach(function (item) {
                buffer(item);
            });
        },
        /**
         * Buffered output callback
         * @type Function
         * @param {Function} callback
         * @param {Boolean} [echo]
         * @return {Function}
         */
        macro(callback, echo) {
            const buffer = this.getBuffer();
            const macro = function () {
                buffer.backup();
                if (isFunction(callback)) {
                    callback.apply(this, arguments);
                }
                const result = buffer.restore();
                return echo === true ? this.echo(result) : result
            }.bind(this);
            macro.ctx = this;
            return macro
        },
        /**
         * @memberOf global
         * @param value
         * @param callback
         * @return {Promise<unknown>}
         */
        resolve(value, callback) {
            return Promise.resolve(value).then(callback.bind(this))
        },
        /**
         * @memberOf global
         */
        async(promise, callback) {
            this.echo(
                this.resolve(promise, function (data) {
                    return this.macro(callback)(data)
                })
            );
        },
        /**
         * @memberOf global
         */
        node: element,
        /**
         * @memberOf global
         */
        element(tag, attr, content) {
            if (isFunction(content)) {
                content = this.macro(content)();
            }
            this.echo(
                this.resolve(content, function (content) {
                    return element(tag, attr, content)
                })
            );
        },
        /**
         * @memberOf global
         * @param {Object} instance
         */
        component(instance) {
            instance = Component(instance);
            return function component(props) {
                this.echo(instance.render(props));
            }.bind(this)
        },
        /**
         * @memberOf global
         * @param name
         * @param defaults
         */
        get(name, defaults) {
            const path = getPath(this, name);
            const result = path.shift();
            const prop = path.pop();
            return hasProp(result, prop) ? result[prop] : defaults
        },
        /**
         * @memberOf global
         * @param {String} name
         * @param value
         * @return
         */
        set(name, value) {
            const path = getPath(this, name);
            const result = path.shift();
            const prop = path.pop();
            if (this.getExtend()) {
                if (hasProp(result, prop)) {
                    return result[prop]
                }
            }
            result[prop] = value;
        },
        /**
         * @memberOf global
         * @param name
         */
        call(name) {
            const params = [].slice.call(arguments, 1);
            const path = getPath(this, name);
            const result = path.shift();
            const prop = path.pop();
            if (isFunction(result[prop])) {
                return result[prop].apply(result, params)
            }
        },
        /**
         * @memberOf global
         * @param object
         * @param callback
         */
        each(object, callback) {
            if (isString(object)) {
                object = this.get(object, []);
            }
            each(object, callback, this);
        },
        /**
         * @memberOf global
         * @param {String} layout
         */
        extend(layout) {
            this.setExtend(true);
            this.setLayout(layout);
        },
        /**
         * @memberOf global
         * @param name
         * @param callback
         * @return {*}
         */
        block(name, callback) {
            const blocks = this.getBlocks();
            const macro = this.macro(callback);
            if (this.getExtend()) {
                blocks[name] = macro;
            } else {
                const block = blocks[name];
                const parent = function () {
                    this.echo(macro());
                }.bind(block ? block.ctx : null);
                if (block) {
                    this.echo(block(parent));
                } else {
                    this.echo(macro(noop));
                }
            }
        },
        /**
         * @memberOf global
         * @param {string} path
         * @param {object} [data]
         * @param {boolean} [cx]
         * @return {string|{}}
         */
        include(path, data = {}, cx = true) {
            const params = extend(cx ? this.clone(true) : {}, data);
            const promise = this.render(path, params);
            this.echo(promise);
        },
        /**
         * @memberOf global
         * @param {string} path
         */
        use(path) {
            const scope = this;
            const promise = this.require(path);
            this.echo(promise);
            return {
                as(namespace) {
                    promise.then((exports) => {
                        scope.set(namespace, exports);
                    });
                    return this
                },
            }
        },
        /**
         * @memberOf global
         * @param {string} path
         */
        from(path) {
            const scope = this;
            const promise = this.require(path);
            this.echo(promise);
            return {
                use() {
                    const params = [].slice.call(arguments);
                    promise.then((exports) => {
                        params.forEach((name) => {
                            scope.set(name, exports[name]);
                        });
                    });
                    return this
                },
            }
        },
    });
    return Scope
};

function Cache(config) {
    const namespace = config.export;
    const list = {};
    const cache = {
        preload() {
            if (isNode() === false) {
                this.load(window[namespace]);
            }
            return this
        },
        exist(key) {
            return hasProp(list, key)
        },
        get(key) {
            return list[key]
        },
        remove(key) {
            delete list[key];
        },
        resolve(key) {
            return Promise.resolve(this.get(key))
        },
        set(key, value) {
            list[key] = value;
            return this
        },
        load(data) {
            extend(list, data);
            return this
        },
    };
    return cache.preload()
}

function init() {
    const config = {};
    const helpers = {};
    const ext = function (path, defaultExt) {
        const ext = path.split('.').pop();
        if (config.extension.supported.indexOf(ext) === -1) {
            path = [path, defaultExt].join('.');
        }
        return path
    };
    const view = {
        output(path, scope) {
            return view.template(path).then(function (template) {
                return template.call(scope, scope, scope.getBuffer(), safeValue)
            })
        },
        render(name, data) {
            const filepath = ext(name, config.extension.default);
            const scope = new view.scope(data);
            return view.output(filepath, scope).then((content) => {
                if (scope.getExtend()) {
                    scope.setExtend(false);
                    const layout = scope.getLayout();
                    const data = scope.clone();
                    return view.render(layout, data)
                }
                return content
            })
        },
        require(name, context) {
            const filepath = ext(name, config.extension.module);
            context.exports = extend({}, context.exports);
            context.module = context;
            return view.output(filepath, context).then((content) => {
                return context.exports
            })
        },
        helpers(methods) {
            methods = methods || {};
            extend(helpers, methods);
            view.scope.helpers(methods);
        },
        configure(options) {
            config.export = typeProp(isString, defaults.export, options.export);
            config.path = typeProp(isString, defaults.path, options.path);
            config.resolver = typeProp(
                isFunction,
                defaults.resolver,
                options.resolver
            );
            config.extension = extend({}, defaults.extension, options.extension);
            config.token = extend({}, defaults.token, options.token);
            config.vars = extend({}, defaults.vars, options.vars);
            view.scope = Scope(config, helpers);
            view.compile = Compiler(config);
            view.wrapper = Wrapper(config);
            view.cache = Cache(config);
            view.template = Template(config, view.cache, view.compile);
            return view
        },
    };
    /**
     *
     * @param name
     * @param options
     * @param callback
     * @return {*}
     * @private
     */
    view.__express = function (name, options, callback) {
        if (isFunction(options)) {
            callback = options;
            options = {};
        }
        options = options || {};
        const settings = options.settings || {};
        const viewPath = settings['views'];
        const viewOptions = settings['view options'] || {};
        const filename = path.relative(viewPath, name);
        view.configure(viewOptions);
        return view
            .render(filename, options)
            .then(function (content) {
                callback(null, content);
            })
            .catch(function (error) {
                callback(error);
            })
    };
    /**
     *
     */
    view.configure({});
    /**
     *
     */
    view.helpers({
        require(name) {
            return view.require(name, this)
        },
        render(name, data) {
            return view.render(name, data)
        },
    });
    return view
}

var index = init();

export { index as default };
