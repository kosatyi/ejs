'use strict';

var path = require('path');
var fs = require('fs');
var chokidar = require('chokidar');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);

var defaults = {};
defaults["export"] = 'ejs.precompiled';
defaults.path = 'views';
defaults.resolver = null;
defaults.extension = {
  supported: ['ejs', 'js', 'html', 'svg', 'css'],
  "default": 'ejs',
  module: 'js'
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
  SAFE: '$$v'
};
defaults.token = {
  start: '<%',
  end: '%>',
  regex: '([\\s\\S]+?)'
};

var typeProp = function typeProp() {
  var args = [].slice.call(arguments);
  var callback = args.shift();
  return args.filter(callback).pop();
};
var isFunction = function isFunction(v) {
  return typeof v === 'function';
};
var isString = function isString(v) {
  return typeof v === 'string';
};

var isNode = new Function('try {return this===global;}catch(e){return false;}');
var symbolEntities = {
  "'": "'",
  '\\': '\\',
  '\r': 'r',
  '\n': 'n',
  '\t': 't',
  "\u2028": 'u2028',
  "\u2029": 'u2029'
};
var htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;'
};

var regexKeys = function regexKeys(obj) {
  return new RegExp(['[', Object.keys(obj).join(''), ']'].join(''), 'g');
};

var htmlEntitiesMatch = regexKeys(htmlEntities);
var symbolEntitiesMatch = regexKeys(symbolEntities);
var entities = function entities() {
  var string = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return ('' + string).replace(htmlEntitiesMatch, function (match) {
    return htmlEntities[match];
  });
};
var symbols = function symbols(string) {
  return ('' + string).replace(symbolEntitiesMatch, function (match) {
    return '\\' + symbolEntities[match];
  });
};
var safeValue = function safeValue(value, escape, check) {
  return (check = value) == null ? '' : escape ? entities(check) : check;
};
var getPath = function getPath(context, name) {
  var data = context;
  var chunk = name.split('.');
  var prop = chunk.pop();
  chunk.forEach(function (part) {
    data = data[part] = data[part] || {};
  });
  return [data, prop];
};
var extend = function extend() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var target = args.shift();
  return args.filter(function (source) {
    return source;
  }).reduce(function (target, source) {
    return Object.assign(target, source);
  }, target);
};
var noop = function noop() {};
var each = function each(object, callback, context) {
  var prop;

  for (prop in object) {
    if (hasProp(object, prop)) {
      callback.call(context || null, object[prop], prop, object);
    }
  }
};
var map = function map(object, callback, context) {
  var result = [];
  each(object, function (value, key, object) {
    var item = callback.call(value, key, object);

    if (item !== undefined) {
      result.push(item);
    }
  }, context);
  return result;
};
var filter = function filter(object, callback, context) {
  var isArray = object instanceof Array;
  var result = isArray ? [] : {};
  each(object, function (value, key, object) {
    var item = callback(value, key, object);

    if (item !== undefined) {
      if (isArray) {
        result.push(item);
      } else {
        result[key] = item;
      }
    }
  }, context);
  return result;
};
var omit = function omit(object, list) {
  return filter(object, function (value, key) {
    if (list.indexOf(key) === -1) {
      return value;
    }
  });
};
var hasProp = function hasProp(object, prop) {
  return object && object.hasOwnProperty(prop);
};

var tags = [{
  symbol: '-',
  format: function format(value) {
    return "'+\n".concat(this.SAFE, "(").concat(value, ",1)+\n'");
  }
}, {
  symbol: '=',
  format: function format(value) {
    return "'+\n".concat(this.SAFE, "(").concat(value, ")+\n'");
  }
}, {
  symbol: '#',
  format: function format(value) {
    return "'+\n/**".concat(value, "**/+\n'");
  }
}, {
  symbol: '',
  format: function format(value) {
    return "')\n".concat(value, "\n").concat(this.BUFFER, "('");
  }
}];

var match = function match(regex, text, callback) {
  var index = 0;
  text.replace(regex, function () {
    var params = [].slice.call(arguments, 0, -1);
    var offset = params.pop();
    var match = params.shift();
    callback(params, index, offset);
    index = offset + match.length;
    return match;
  });
};

var Compiler = function Compiler(config) {
  var token = config.token;
  var vars = config.vars;
  var module = config.extension.module;
  var matches = [];
  var formats = [];
  tags.forEach(function (item) {
    matches.push(token.start.concat(item.symbol).concat(token.regex).concat(token.end));
    formats.push(item.format.bind(vars));
  });
  var regex = new RegExp(matches.join('|').concat('|$'), 'g');
  /**
   * @type Function
   * @name Compile
   */

  return function (content, path) {
    var SCOPE = vars.SCOPE,
        SAFE = vars.SAFE,
        BUFFER = vars.BUFFER;
    var extension = path.split('.').pop();

    if (extension === module) {
      content = [token.start, content, token.end].join('\n');
    }

    var source = "".concat(BUFFER, "('");
    match(regex, content, function (params, index, offset) {
      source += symbols(content.slice(index, offset));
      params.forEach(function (value, index) {
        if (value) source += formats[index](value);
      });
    });
    source += "');";
    source = "with(".concat(SCOPE, "){").concat(source, "}");
    source = "".concat(BUFFER, ".start();").concat(source, "return ").concat(BUFFER, ".end();");
    source += "\n//# sourceURL=".concat(path);
    var result = null;

    try {
      result = new Function(SCOPE, BUFFER, SAFE, source);
      result.source = result.toString();
    } catch (e) {
      e.filename = path;
      e.source = source;
      throw e;
    }

    return result;
  };
};

var Wrapper = function Wrapper(config) {
  var name = config["export"];
  return function (list) {
    var out = '(function(o){\n';
    list.forEach(function (item) {
      out += 'o[' + JSON.stringify(item.name) + ']=' + String(item.content) + '\n';
    });
    out += '})(window["' + name + '"] = window["' + name + '"] || {});\n';
    return out;
  };
};

var HttpRequest = function HttpRequest(template) {
  return window.fetch(template).then(function (response) {
    return response.text();
  });
};

var FileSystem = function FileSystem(template) {
  return new Promise(function (resolve, reject) {
    fs__default["default"].readFile(template, function (error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(data.toString());
      }
    });
  });
};

var Watcher = function Watcher(path, cache) {
  return chokidar__default["default"].watch('.', {
    cwd: path
  }).on('change', function (name) {
    cache.remove(name);
  }).on('error', function (error) {
    console.log('watcher error: ' + error);
  });
};

var Template = function Template(config, cache, compile) {
  var path = config.path;
  config.token || {};
  var resolver = isFunction(config.resolver) ? config.resolver : isNode() ? FileSystem : HttpRequest;

  var normalize = function normalize(template) {
    template = [path, template].join('/');
    template = template.replace(/\/\//g, '/');
    return template;
  };

  var resolve = function resolve(template) {
    return resolver(normalize(template));
  };

  var result = function result(content, template) {
    cache.set(template, content);
    return content;
  };

  var get = function get(template) {
    if (cache.exist(template)) {
      return cache.resolve(template);
    }

    var content = resolve(template).then(function (content) {
      return result(compile(content, template), template);
    });
    return result(content, template);
  };

  if (config.watch && isNode()) {
    Watcher(path, cache);
  }

  return get;
};

var selfClosed = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
var space = ' ';
var quote = '"';
var equal = '=';
var slash = '/';
var lt = '<';
var gt = '>';
function element(tag, attrs, content) {
  var result = [];
  var hasClosedTag = selfClosed.indexOf(tag) === -1;
  var attributes = map(attrs, function (value, key) {
    if (value !== null && value !== undefined) {
      return [entities(key), [quote, entities(value), quote].join('')].join(equal);
    }
  }).join(space);
  result.push([lt, tag, space, attributes, gt].join(''));

  if (content) {
    result.push(content instanceof Array ? content.join('') : content);
  }

  if (hasClosedTag) {
    result.push([lt, slash, tag, gt].join(''));
  }

  return result.join('');
}

var resolve = function resolve(list) {
  return Promise.all(list).then(function (list) {
    return list.join('');
  });
};
/**
 *
 * @return {function}
 */


var Buffer = function Buffer() {
  var store = [],
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
    var result = array.concat();
    array = store.pop();
    return resolve(result);
  };

  buffer.end = function () {
    return resolve(array);
  };

  return buffer;
};

/**
 *
 * @param {{}} instance
 * @method create
 */

var Component = function Component(instance) {
  var defaults = extend({}, instance.props);
  var create = instance.create;
  return {
    element: element,
    create: create,
    render: function render(props) {
      return this.create(extend({}, defaults, props));
    }
  };
};

var Scope = function Scope(config, methods) {
  /**
   *
   */
  var _config$vars = config.vars,
      EXTEND = _config$vars.EXTEND,
      MACROS = _config$vars.MACROS,
      LAYOUT = _config$vars.LAYOUT,
      BLOCKS = _config$vars.BLOCKS,
      BUFFER = _config$vars.BUFFER;
  /**
   *
   * @param data
   * @constructor
   */

  function Scope() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.setBlocks();
    extend(this, data);
    this.setBuffer();
    this.setLayout(false);
    this.setExtend(false);
  }

  Object.defineProperties(Scope.prototype, {
    setBuffer: {
      value: function value() {
        Object.defineProperty(this, BUFFER, {
          value: Buffer(),
          writable: false,
          configurable: false
        });
      },
      writable: false,
      configurable: false
    },
    getBuffer: {
      value: function value() {
        return this[BUFFER];
      },
      writable: false,
      configurable: false
    },
    setBlocks: {
      value: function value() {
        Object.defineProperty(this, BLOCKS, {
          value: {},
          writable: true,
          enumerable: true,
          configurable: false
        });
      },
      writable: false,
      configurable: false
    },
    getBlocks: {
      value: function value() {
        return this[BLOCKS];
      },
      writable: false,
      configurable: false
    },
    setExtend: {
      value: function value(state) {
        Object.defineProperty(this, EXTEND, {
          value: state,
          writable: true,
          configurable: false
        });
      },
      writable: false,
      configurable: false
    },
    getExtend: {
      value: function value() {
        return this[EXTEND];
      },
      writable: false,
      configurable: false
    },
    setLayout: {
      value: function value(layout) {
        Object.defineProperty(this, LAYOUT, {
          value: layout,
          writable: true,
          configurable: false
        });
      },
      writable: false,
      configurable: false
    },
    getLayout: {
      value: function value() {
        return this[LAYOUT];
      },
      writable: false,
      configurable: false
    }
  });

  Scope.helpers = function (methods) {
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
    clone: function clone(exclude_blocks) {
      var filter = [LAYOUT, EXTEND, MACROS, BUFFER];

      if (exclude_blocks === true) {
        filter.push(BLOCKS);
      }

      return omit(this, filter);
    },

    /**
     * Join values to output buffer
     * @type Function
     */
    echo: function echo() {
      var buffer = this.getBuffer();
      var params = [].slice.call(arguments);
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
    macro: function macro(callback, echo) {
      var buffer = this.getBuffer();

      var macro = function () {
        buffer.backup();

        if (isFunction(callback)) {
          callback.apply(this, arguments);
        }

        var result = buffer.restore();
        return echo === true ? this.echo(result) : result;
      }.bind(this);

      macro.ctx = this;
      return macro;
    },

    /**
     * @memberOf global
     * @param value
     * @param callback
     * @return {Promise<unknown>}
     */
    resolve: function resolve(value, callback) {
      return Promise.resolve(value).then(callback.bind(this));
    },

    /**
     * @memberOf global
     */
    async: function async(promise, callback) {
      this.echo(this.resolve(promise, function (data) {
        return this.macro(callback)(data);
      }));
    },

    /**
     * @memberOf global
     */
    node: element,

    /**
     * @memberOf global
     */
    element: function element$1(tag, attr, content) {
      if (isFunction(content)) {
        content = this.macro(content)();
      }

      this.echo(this.resolve(content, function (content) {
        return element(tag, attr, content);
      }));
    },

    /**
     * @memberOf global
     * @param {Object} instance
     */
    component: function component(instance) {
      instance = Component(instance);
      return function component(props) {
        this.echo(instance.render(props));
      }.bind(this);
    },

    /**
     * @memberOf global
     * @param name
     * @param defaults
     */
    get: function get(name, defaults) {
      var path = getPath(this, name);
      var result = path.shift();
      var prop = path.pop();
      return hasProp(result, prop) ? result[prop] : defaults;
    },

    /**
     * @memberOf global
     * @param {String} name
     * @param value
     * @return
     */
    set: function set(name, value) {
      var path = getPath(this, name);
      var result = path.shift();
      var prop = path.pop();

      if (this.getExtend()) {
        if (hasProp(result, prop)) {
          return result[prop];
        }
      }

      result[prop] = value;
    },

    /**
     * @memberOf global
     * @param name
     */
    call: function call(name) {
      var params = [].slice.call(arguments, 1);
      var path = getPath(this, name);
      var result = path.shift();
      var prop = path.pop();

      if (isFunction(result[prop])) {
        return result[prop].apply(result, params);
      }
    },

    /**
     * @memberOf global
     * @param object
     * @param callback
     */
    each: function each$1(object, callback) {
      if (isString(object)) {
        object = this.get(object, []);
      }

      each(object, callback, this);
    },

    /**
     * @memberOf global
     * @param {String} layout
     */
    extend: function extend(layout) {
      this.setExtend(true);
      this.setLayout(layout);
    },

    /**
     * @memberOf global
     * @param name
     * @param callback
     * @return {*}
     */
    block: function block(name, callback) {
      var blocks = this.getBlocks();
      var macro = this.macro(callback);

      if (this.getExtend()) {
        blocks[name] = macro;
      } else {
        var block = blocks[name];

        var parent = function () {
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
    include: function include(path) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var cx = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var params = extend(cx ? this.clone(true) : {}, data);
      var promise = this.render(path, params);
      this.echo(promise);
    },

    /**
     * @memberOf global
     * @param {string} path
     */
    use: function use(path) {
      var scope = this;

      var promise = this.require(path);

      this.echo(promise);
      return {
        as: function as(namespace) {
          promise.then(function (exports) {
            scope.set(namespace, exports);
          });
          return this;
        }
      };
    },

    /**
     * @memberOf global
     * @param {string} path
     */
    from: function from(path) {
      var scope = this;

      var promise = this.require(path);

      this.echo(promise);
      return {
        use: function use() {
          var params = [].slice.call(arguments);
          promise.then(function (exports) {
            params.forEach(function (name) {
              scope.set(name, exports[name]);
            });
          });
          return this;
        }
      };
    }
  });
  return Scope;
};

function Cache(config) {
  var namespace = config["export"];
  var list = {};
  var cache = {
    preload: function preload() {
      if (isNode() === false) {
        this.load(window[namespace]);
      }

      return this;
    },
    exist: function exist(key) {
      return hasProp(list, key);
    },
    get: function get(key) {
      return list[key];
    },
    remove: function remove(key) {
      delete list[key];
    },
    resolve: function resolve(key) {
      return Promise.resolve(this.get(key));
    },
    set: function set(key, value) {
      list[key] = value;
      return this;
    },
    load: function load(data) {
      extend(list, data);
      return this;
    }
  };
  return cache.preload();
}

function init() {
  var config = {};
  var _helpers = {};

  var ext = function ext(path, defaultExt) {
    var ext = path.split('.').pop();

    if (config.extension.supported.indexOf(ext) === -1) {
      path = [path, defaultExt].join('.');
    }

    return path;
  };

  var view = {
    output: function output(path, scope) {
      return view.template(path).then(function (template) {
        return template.call(scope, scope, scope.getBuffer(), safeValue);
      });
    },
    render: function render(name, data) {
      var filepath = ext(name, config.extension["default"]);
      var scope = new view.scope(data);
      return view.output(filepath, scope).then(function (content) {
        if (scope.getExtend()) {
          scope.setExtend(false);
          var layout = scope.getLayout();

          var _data = scope.clone();

          return view.render(layout, _data);
        }

        return content;
      });
    },
    require: function require(name, context) {
      var filepath = ext(name, config.extension.module);
      context.exports = extend({}, context.exports);
      context.module = context;
      return view.output(filepath, context).then(function (content) {
        return context.exports;
      });
    },
    helpers: function helpers(methods) {
      methods = methods || {};
      extend(_helpers, methods);
      view.scope.helpers(methods);
    },
    configure: function configure(options) {
      config["export"] = typeProp(isString, defaults["export"], options["export"]);
      config.path = typeProp(isString, defaults.path, options.path);
      config.resolver = typeProp(isFunction, defaults.resolver, options.resolver);
      config.extension = extend({}, defaults.extension, options.extension);
      config.token = extend({}, defaults.token, options.token);
      config.vars = extend({}, defaults.vars, options.vars);
      view.scope = Scope(config, _helpers);
      view.compile = Compiler(config);
      view.wrapper = Wrapper(config);
      view.cache = Cache(config);
      view.template = Template(config, view.cache, view.compile);
      return view;
    }
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
    var settings = options.settings || {};
    var viewPath = settings['views'];
    var viewOptions = settings['view options'] || {};
    var filename = path__default["default"].relative(viewPath, name);
    view.configure(viewOptions);
    return view.render(filename, options).then(function (content) {
      callback(null, content);
    })["catch"](function (error) {
      callback(error);
    });
  };
  /**
   *
   */


  view.configure({});
  /**
   *
   */

  view.helpers({
    require: function require(name) {
      return view.require(name, this);
    },
    render: function render(name, data) {
      return view.render(name, data);
    }
  });
  return view;
}

var index = init();

module.exports = index;
