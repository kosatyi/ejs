var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

const defaults$1 = {};

defaults$1.export = 'ejs.precompiled';
defaults$1.path = 'views';
defaults$1.resolver = null;

defaults$1.extension = {
    supported: ['ejs', 'js', 'html', 'svg', 'css'],
    default: 'ejs',
    module: 'js',
};

defaults$1.vars = {
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

defaults$1.token = {
    start: '<%',
    end: '%>',
    regex: '([\\s\\S]+?)',
};

var defaults_1 = defaults$1;

const utils = {};

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

function regexKeys(obj) {
    return new RegExp(['[', Object.keys(obj).join(''), ']'].join(''), 'g')
}

const htmlEntitiesMatch = regexKeys(htmlEntities);
const symbolEntitiesMatch = regexKeys(symbolEntities);

utils.entities = function (string = '') {
    return ('' + string).replace(
        htmlEntitiesMatch,
        (match) => htmlEntities[match]
    )
};

utils.symbols = function (string) {
    return ('' + string).replace(
        symbolEntitiesMatch,
        (match) => '\\' + symbolEntities[match]
    )
};

utils.safeValue = function (value, escape, check) {
    return (check = value) == null ? '' : escape ? utils.entities(check) : check
};

utils.getPath = function (context, name) {
    let data = context;
    let chunk = name.split('.');
    let prop = chunk.pop();
    chunk.forEach(function (part) {
        data = data[part] = data[part] || {};
    });
    return [data, prop]
};

utils.assign = function (list) {
    const sources = (list || [null]).map(function (source) {
        return source || {}
    });
    return {
        target: sources.shift(),
        sources,
    }
};

utils.isPromise = function (p) {
    return Boolean(p && typeof p.then === 'function')
};

utils.merge = function (target) {
    return [].slice
        .call(arguments, 1)
        .filter(function (source) {
            return source
        })
        .reduce(function (target, source) {
            return Object.assign(target, source)
        }, target)
};

utils.extend = function (target) {
    return [].slice
        .call(arguments, 1)
        .filter(function (source) {
            return source
        })
        .reduce(function (target, source) {
            return Object.assign(target, source)
        }, target)
};

utils.noop = function () {};

utils.format = function (pattern, params) {
    pattern = pattern || '';
    params = params || {};
    return pattern.replace(/\${(.+?)}/g, function (match, prop) {
        return utils.hasProp(params, prop) ? params[prop] : match
    })
};

utils.each = function (object, callback, context) {
    let prop;
    for (prop in object) {
        if (utils.hasProp(object, prop)) {
            callback.call(context || null, object[prop], prop, object);
        }
    }
};

utils.map = function (object, callback, context) {
    const result = [];
    utils.each(
        object,
        function (value, key, object) {
            let item = callback.call(this, value, key, object);
            if (item !== undefined) {
                result.push(item);
            }
        },
        context
    );
    return result
};

utils.filter = function (object, callback, context) {
    const isArray = object instanceof Array;
    const result = isArray ? [] : {};
    utils.each(
        object,
        function (value, key, object) {
            let item = callback.call(this, value, key, object);
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

utils.omit = function (object, list) {
    return utils.filter(object, function (value, key) {
        if (list.indexOf(key) === -1) {
            return value
        }
    })
};

utils.uuid = function (str) {
    let i = str.length;
    let hash1 = 5381;
    let hash2 = 52711;
    while (i--) {
        const char = str.charCodeAt(i);
        hash1 = (hash1 * 33) ^ char;
        hash2 = (hash2 * 33) ^ char;
    }
    return (hash1 >>> 0) * 4096 + (hash2 >>> 0)
};

utils.random = function (size) {
    let string = '';
    let chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
    let limit = chars.length;
    let length = size || 10;
    for (let i = 0; i < length; i++) {
        string += chars.charAt(Math.floor(Math.random() * limit));
    }
    return string
};

utils.hasProp = function (object, prop) {
    return object && object.hasOwnProperty(prop)
};

var utils_1 = utils;

const type = {};

type.isFunction = function (v) {
    return typeof v === 'function'
};

type.isString = function (v) {
    return typeof v === 'string'
};

var type_1 = type;

const { entities, map } = utils_1;

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

function element$2(tag, attrs, content) {
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

var element_1 = element$2;

function resolve(list) {
    return Promise.all(list).then(function (list) {
        return list.join('')
    })
}
/**
 *
 * @return {function}
 */
function Buffer$1() {
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
}

var buffer = Buffer$1;

const { extend: extend$3 } = utils_1;
const element$1 = element_1;
/**
 *
 * @param {{}} instance
 * @method create
 */
function Component$1(instance) {
    this.props = extend$3({}, instance.props);
    this.create = instance.create.bind(this);
}
/**
 *
 */
Component$1.prototype = {
    element: element$1,
    render(props) {
        return this.create(extend$3({}, this.props, props))
    },
};
/**
 *  @type {function}
 */
var component = Component$1;

const { extend: extend$2, omit, each, getPath, hasProp: hasProp$1, noop } = utils_1;
const { isFunction: isFunction$1, isString } = type_1;
const element = element_1;
const Buffer = buffer;
const Component = component;

function configure$1(config) {
    const { EXTEND, MACROS, LAYOUT, PRINT, BLOCKS, BUFFER } = config.vars;
    function Scope(data = {}) {
        this.setBlocks();
        extend$2(this, data);
        this.setBuffer();
        this.setLayout(false);
        this.setExtend(false);
    }
    Scope.helpers = function (methods) {
        extend$2(Scope.prototype, methods);
    };
    Scope.prototype = {
        getBuffer() {
            return this[BUFFER]
        },
        setBuffer() {
            this[BUFFER] = Buffer();
        },
        setExtend(state) {
            this[EXTEND] = state;
        },
        getExtend() {
            return this[EXTEND]
        },
        getLayout() {
            return this[LAYOUT]
        },
        setLayout(layout) {
            this[LAYOUT] = layout;
        },
        setBlocks() {
            this[BLOCKS] = {};
        },
        getBlocks() {
            return this[BLOCKS]
        },
        clone(exclude_blocks) {
            const filter = [LAYOUT, EXTEND, MACROS, PRINT, BUFFER];
            if (exclude_blocks === true) {
                filter.push(BLOCKS);
            }
            return omit(this, filter)
        },
        /**
         * Join values to output buffer
         * @memberOf global
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
         * @memberOf global
         * @type Function
         * @param {Function} callback
         * @param {Boolean} [echo]
         * @return {Function}
         */
        macro(callback, echo) {
            const buffer = this.getBuffer();
            const macro = function () {
                buffer.backup();
                if (isFunction$1(callback)) {
                    callback.apply(this, arguments);
                }
                const result = buffer.restore();
                return echo === true ? this.echo(result) : result
            }.bind(this);
            macro.ctx = this;
            return macro
        },
        /**
         *
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
            if (isFunction$1(content)) {
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
            instance = new Component(instance);
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
            return hasProp$1(result, prop) ? result[prop] : defaults
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
                if (hasProp$1(result, prop)) {
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
            if (isFunction$1(result[prop])) {
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
            const params = extend$2(cx ? this.clone(true) : {}, data);
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
                    promise.then(function (exports) {
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
                    promise.then(function (exports) {
                        params.forEach(function (name) {
                            scope.set(name, exports[name]);
                        });
                    });
                    return this
                },
            }
        },
    };
    return Scope
}

var scope = configure$1;

const { symbols } = utils_1;

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

function Compiler$1(config) {
    this.setup(config);
}

Compiler$1.prototype = {
    setup(config) {
        this.extension = config.extension;
        this.token = config.token;
        this.vars = config.vars;
        this.matches = [];
        this.formats = [];
        tags.forEach(function (item) {
            this.matches.push(
                this.token.start
                    .concat(item.symbol)
                    .concat(this.token.regex)
                    .concat(this.token.end)
            );
            this.formats.push(item.format.bind(this.vars));
        }, this);
        this.regex = new RegExp(this.matches.join('|').concat('|$'), 'g');
    },
    match(text, callback) {
        let index = 0;
        callback = callback.bind(this);
        text.replace(this.regex, function () {
            const params = [].slice.call(arguments, 0, -1);
            const offset = params.pop();
            const match = params.shift();
            callback(params, index, offset);
            index = offset + match.length;
            return match
        });
    },
    compile(content, path) {
        const { SCOPE, SAFE, BUFFER } = this.vars;
        let result = null;
        let source = `${BUFFER}('`;
        this.match(content, function (params, index, offset) {
            source += symbols(content.slice(index, offset));
            params.forEach(function (value, index) {
                if (value) source += this.formats[index](value);
            }, this);
        });
        source += `');`;
        source = `with(${SCOPE}){${source}}`;
        source = `${BUFFER}.start();${source}return ${BUFFER}.end();`;
        source += `\n//# sourceURL=${path}`;
        try {
            result = new Function(SCOPE, BUFFER, SAFE, source);
            result.source = result.toString();
        } catch (e) {
            e.filename = path;
            e.source = source;
            throw e
        }
        return result
    },
};

var compiler = Compiler$1;

function Wrapper$1(config) {
    this.configure(config);
}

Wrapper$1.prototype = {
    configure(config) {
        this.name = config.export;
    },
    browser(list) {
        let name = this.name;
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
    },
};

var wrapper = Wrapper$1;

const { extend: extend$1, hasProp } = utils_1;

function Cache$1(config) {
    this.list = {};
    this.enabled = config.cache || false;
    console.log('cache is enabled', this.enabled);
    this.namespace = config.export;
    this.preload();
}

Cache$1.prototype = {
    exist(key) {
        return hasProp(this.list, key)
    },
    get(key) {
        return this.list[key]
    },
    remove(key) {
        delete this.list[key];
    },
    resolve(key) {
        return Promise.resolve(this.get(key))
    },
    set(key, value) {
        this.list[key] = value;
    },
    preload() {
        extend$1(this.list, commonjsGlobal[this.namespace]);
    },
    load(list) {
        extend$1(this.list, list);
    },
};

var cache = Cache$1;

const fs = require('fs');
const chokidar = require('chokidar');
const Cache = cache;

const isNode = new Function(
    'try {return this===global;}catch(e){return false;}'
);

function HttpRequest(template) {
    return window.fetch(template).then(function (response) {
        return response.text()
    })
}

function FileSystem(template) {
    return new Promise(function (resolve, reject) {
        fs.readFile(template, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.toString());
            }
        });
    })
}

function Loader$1(config, compiler) {
    this.cache = new Cache(config);
    this.compiler = compiler;
    if (typeof config.resolver === 'function') {
        this.resolver = config.resolver;
    } else {
        this.resolver = isNode() ? FileSystem : HttpRequest;
    }
    this.path = config.path;
    this.token = config.token || {};
    this.module = config.extension.module;
    this.default = config.extension.default;
    this.supported = config.extension.supported || [];
    this.supported.push(this.module);
    this.supported.push(this.default);
    if (config.watch && isNode()) {
        this.watch();
    }
}

Loader$1.prototype = {
    watch() {
        this.watcher = chokidar.watch('.', {
            cwd: this.path,
        });
        this.watcher.on(
            'change',
            function (name) {
                this.cache.remove(name);
            }.bind(this)
        );
        this.watcher.on(
            'error',
            function (error) {
                console.log('watcher error: ' + error);
            }.bind(this)
        );
    },
    normalize(template) {
        template = [this.path, template].join('/');
        template = template.replace(/\/\//g, '/');
        return template
    },
    extension(template) {
        let ext = template.split('.').pop();
        if (this.supported.indexOf(ext) === -1) {
            template = [template, this.default].join('.');
        }

        return template
    },
    resolve(template) {
        template = this.normalize(template);
        return this.resolver(template, this).then(
            function (content) {
                return this.process(content, template)
            }.bind(this)
        )
    },
    process(content, template) {
        let extension = template.split('.').pop();
        if (this.module.indexOf(extension) > -1) {
            content = [this.token.start, content, this.token.end].join('\n');
        }
        return content
    },
    get(path) {
        let template = this.extension(path);
        if (this.cache.exist(template)) {
            return this.cache.resolve(template)
        }
        const content = this.resolve(template).then(
            function (content) {
                content = this.compiler.compile(content, template);
                return this.result(content, template)
            }.bind(this)
        );
        return this.result(content, template)
    },
    result(content, template) {
        this.cache.set(template, content);
        return content
    },
};

var loader = Loader$1;

const path = require('path');
const defaults = defaults_1;
const { extend, safeValue } = utils_1;
const { isFunction } = type_1;
const ConfigureScope = scope;
const Compiler = compiler;
const Wrapper = wrapper;
const Loader = loader;

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
    );
    //
    const Scope = ConfigureScope(config);
    //
    const compiler = new Compiler(config);
    const wrapper = new Wrapper(config);
    const loader = new Loader(config, compiler);
    //
    function template(path, defaultExt) {
        const ext = path.split('.').pop();
        if (config.extension.supported.indexOf(ext) === -1) {
            path = [path, defaultExt].join('.');
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
        const view = template(name, config.extension.default);
        const scope = new Scope(data);
        return output(view, scope).then(function (content) {
            if (scope.getExtend()) {
                scope.setExtend(false);
                const layout = scope.getLayout();
                const data = scope.clone();
                return render(layout, data)
            }
            return content
        })
    }
    //
    function require(name) {
        const view = template(name, config.extension.module);
        this.exports = {};
        this.module = this;
        return output(view, this).then(
            function () {
                return this.exports
            }.bind(this)
        )
    }
    //
    let expressInstance = null;
    //
    function express(name, options, callback) {
        if (isFunction(options)) {
            callback = options;
            options = {};
        }
        options = options || {};
        const settings = options.settings || {};
        const viewPath = settings['views'];
        const viewOptions = settings['view options'] || {};
        const filename = path.relative(viewPath, name);
        if (expressInstance === null) {
            expressInstance = configure(viewOptions);
        }
        return expressInstance
            .render(filename, options)
            .then(function (content) {
                callback(null, content);
            })
            .catch(function (error) {
                callback(error);
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
    });

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
            extend(Scope.prototype, methods || {});
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

var src = configure({});

export { src as default };
