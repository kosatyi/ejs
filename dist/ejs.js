(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ejs = factory());
})(this, (function () { 'use strict';

    var path = {};

    var defaults = {};
    defaults["export"] = 'ejs.precompiled';
    defaults.path = 'views';
    defaults.resolver = null;
    defaults.extension = {
      template: 'ejs',
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
    /**
     *
     * @param {Object} config
     * @return {function(*, *): Function}
     * @constructor
     */


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
        path.readFile(template, function (error, data) {
          if (error) {
            reject(error);
          } else {
            resolve(data.toString());
          }
        });
      });
    };

    var Watcher = function Watcher(path$1, cache) {
      return path.watch('.', {
        cwd: path$1
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

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

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
      var _Object$definePropert;

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
        extend(this, data);
      }
      /**
       *
       */


      Object.defineProperties(Scope.prototype, (_Object$definePropert = {}, _defineProperty(_Object$definePropert, BUFFER, {
        value: Buffer(),
        writable: false,
        configurable: false,
        enumerable: false
      }), _defineProperty(_Object$definePropert, BLOCKS, {
        value: {},
        writable: false,
        configurable: false,
        enumerable: false
      }), _defineProperty(_Object$definePropert, EXTEND, {
        value: false,
        writable: true,
        configurable: false,
        enumerable: false
      }), _defineProperty(_Object$definePropert, LAYOUT, {
        value: false,
        writable: true,
        configurable: false,
        enumerable: false
      }), _defineProperty(_Object$definePropert, "setBuffer", {
        value: function value(_value) {
          this[BUFFER] = _value;
        },
        writable: false,
        configurable: false
      }), _defineProperty(_Object$definePropert, "getBuffer", {
        value: function value() {
          return this[BUFFER];
        },
        writable: false,
        configurable: false
      }), _defineProperty(_Object$definePropert, "setBlocks", {
        value: function value(_value2) {
          this[BLOCKS] = _value2;
        },
        writable: false,
        configurable: false
      }), _defineProperty(_Object$definePropert, "getBlocks", {
        value: function value() {
          return this[BLOCKS];
        },
        writable: false,
        configurable: false
      }), _defineProperty(_Object$definePropert, "setExtend", {
        value: function value(_value3) {
          this[EXTEND] = _value3;
        },
        writable: false,
        configurable: false
      }), _defineProperty(_Object$definePropert, "getExtend", {
        value: function value() {
          return this[EXTEND];
        },
        writable: false,
        configurable: false
      }), _defineProperty(_Object$definePropert, "setLayout", {
        value: function value(layout) {
          this[LAYOUT] = layout;
        },
        writable: false,
        configurable: false
      }), _defineProperty(_Object$definePropert, "getLayout", {
        value: function value() {
          return this[LAYOUT];
        },
        writable: false,
        configurable: false
      }), _Object$definePropert));

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
         * @param {String} namespace
         * @param {Object} instance
         */
        component: function component(namespace, instance) {
          var _this = this;

          instance = Component(instance);
          this.set(namespace, function (props) {
            _this.echo(instance.render(props));
          });
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
      /**
       * @type {Object}
       */
      var config = {};
      var _helpers = {};

      var ext = function ext(path, defaults) {
        var ext = path.split('.').pop();

        if (ext !== defaults) {
          path = [path, defaults].join('.');
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
          var filepath = ext(name, config.extension.template);
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
        require: function require(name) {
          var filepath = ext(name, config.extension.module);
          var scope = new view.scope({});
          return view.output(filepath, scope).then(function () {
            return scope;
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
        var filename = path.relative(viewPath, name);
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

    return index;

}));
