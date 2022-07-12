var ejs = (function () {
    'use strict';

    var path = {};

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

    function regexKeys(obj) {
      return new RegExp(['[', Object.keys(obj).join(''), ']'].join(''), 'g');
    }

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
    var extend = function extend(target) {
      return [].slice.call(arguments, 1).filter(function (source) {
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
    var isNode = new Function('try {return this===global;}catch(e){return false;}');
    var map = function map(object, callback, context) {
      var result = [];
      each(object, function (value, key, object) {
        var item = callback.call(this, value, key, object);

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
        var item = callback.call(this, value, key, object);

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

    var isFunction = function isFunction(v) {
      return typeof v === 'function';
    };
    var isString = function isString(v) {
      return typeof v === 'string';
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

    function resolve(list) {
      return Promise.all(list).then(function (list) {
        return list.join('');
      });
    }
    /**
     *
     * @return {function}
     */


    function Buffer() {
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
    }

    /**
     *
     * @param {{}} instance
     * @method create
     */

    function Component(instance) {
      this.props = extend({}, instance.props);
      this.create = instance.create.bind(this);
    }
    /**
     *
     */


    Component.prototype = {
      element: element,
      render: function render(props) {
        return this.create(extend({}, this.props, props));
      }
    };

    function configure$1(config) {
      var _config$vars = config.vars,
          EXTEND = _config$vars.EXTEND,
          MACROS = _config$vars.MACROS,
          LAYOUT = _config$vars.LAYOUT,
          PRINT = _config$vars.PRINT,
          BLOCKS = _config$vars.BLOCKS,
          BUFFER = _config$vars.BUFFER;

      function Scope() {
        var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.setBlocks();
        extend(this, data);
        this.setBuffer();
        this.setLayout(false);
        this.setExtend(false);
      }

      Scope.helpers = function (methods) {
        extend(Scope.prototype, methods);
      };

      Scope.prototype = {
        getBuffer: function getBuffer() {
          return this[BUFFER];
        },
        setBuffer: function setBuffer() {
          this[BUFFER] = Buffer();
        },
        setExtend: function setExtend(state) {
          this[EXTEND] = state;
        },
        getExtend: function getExtend() {
          return this[EXTEND];
        },
        getLayout: function getLayout() {
          return this[LAYOUT];
        },
        setLayout: function setLayout(layout) {
          this[LAYOUT] = layout;
        },
        setBlocks: function setBlocks() {
          this[BLOCKS] = {};
        },
        getBlocks: function getBlocks() {
          return this[BLOCKS];
        },
        clone: function clone(exclude_blocks) {
          var filter = [LAYOUT, EXTEND, MACROS, PRINT, BUFFER];

          if (exclude_blocks === true) {
            filter.push(BLOCKS);
          }

          return omit(this, filter);
        },

        /**
         * Join values to output buffer
         * @memberOf global
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
         * @memberOf global
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
         *
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
          instance = new Component(instance);
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
      };
      return Scope;
    }

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

    function Compiler(config) {
      this.setup(config);
    }

    Compiler.prototype = {
      setup: function setup(config) {
        this.extension = config.extension;
        this.token = config.token;
        this.vars = config.vars;
        this.matches = [];
        this.formats = [];
        tags.forEach(function (item) {
          this.matches.push(this.token.start.concat(item.symbol).concat(this.token.regex).concat(this.token.end));
          this.formats.push(item.format.bind(this.vars));
        }, this);
        this.regex = new RegExp(this.matches.join('|').concat('|$'), 'g');
      },
      match: function match(text, callback) {
        var index = 0;
        callback = callback.bind(this);
        text.replace(this.regex, function () {
          var params = [].slice.call(arguments, 0, -1);
          var offset = params.pop();
          var match = params.shift();
          callback(params, index, offset);
          index = offset + match.length;
          return match;
        });
      },
      compile: function compile(content, path) {
        var _this$vars = this.vars,
            SCOPE = _this$vars.SCOPE,
            SAFE = _this$vars.SAFE,
            BUFFER = _this$vars.BUFFER;
        var result = null;
        var source = "".concat(BUFFER, "('");
        this.match(content, function (params, index, offset) {
          source += symbols(content.slice(index, offset));
          params.forEach(function (value, index) {
            if (value) source += this.formats[index](value);
          }, this);
        });
        source += "');";
        source = "with(".concat(SCOPE, "){").concat(source, "}");
        source = "".concat(BUFFER, ".start();").concat(source, "return ").concat(BUFFER, ".end();");
        source += "\n//# sourceURL=".concat(path);

        try {
          result = new Function(SCOPE, BUFFER, SAFE, source);
          result.source = result.toString();
        } catch (e) {
          e.filename = path;
          e.source = source;
          throw e;
        }

        return result;
      }
    };

    function Wrapper(config) {
      this.configure(config);
    }

    Wrapper.prototype = {
      configure: function configure(config) {
        this.name = config["export"];
      },
      browser: function browser(list) {
        var name = this.name;
        var out = '(function(o){\n';
        list.forEach(function (item) {
          out += 'o[' + JSON.stringify(item.name) + ']=' + String(item.content) + '\n';
        });
        out += '})(window["' + name + '"] = window["' + name + '"] || {});\n';
        return out;
      }
    };

    function Cache(config) {
      this.list = {};
      this.enabled = config.cache || false;
      this.namespace = config["export"];
      this.preload();
    }

    Cache.prototype = {
      exist: function exist(key) {
        return hasProp(this.list, key);
      },
      get: function get(key) {
        return this.list[key];
      },
      remove: function remove(key) {
        delete this.list[key];
      },
      resolve: function resolve(key) {
        return Promise.resolve(this.get(key));
      },
      set: function set(key, value) {
        this.list[key] = value;
      },
      preload: function preload() {
        if (isNode() === false) {
          extend(this.list, window[this.namespace]);
        }
      },
      load: function load(list) {
        extend(this.list, list);
      }
    };

    function HttpRequest(template) {
      return window.fetch(template).then(function (response) {
        return response.text();
      });
    }

    function FileSystem(template) {
      return new Promise(function (resolve, reject) {
        path.readFile(template, function (error, data) {
          if (error) {
            reject(error);
          } else {
            resolve(data.toString());
          }
        });
      });
    }

    function Loader(config, compiler) {
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
      this["default"] = config.extension["default"];
      this.supported = config.extension.supported || [];
      this.supported.push(this.module);
      this.supported.push(this["default"]);

      if (config.watch && isNode()) {
        this.watch();
      }
    }

    Loader.prototype = {
      watch: function watch() {
        this.watcher = path.watch('.', {
          cwd: this.path
        });
        this.watcher.on('change', function (name) {
          this.cache.remove(name);
        }.bind(this));
        this.watcher.on('error', function (error) {
          console.log('watcher error: ' + error);
        }.bind(this));
      },
      normalize: function normalize(template) {
        template = [this.path, template].join('/');
        template = template.replace(/\/\//g, '/');
        return template;
      },
      extension: function extension(template) {
        var ext = template.split('.').pop();

        if (this.supported.indexOf(ext) === -1) {
          template = [template, this["default"]].join('.');
        }

        return template;
      },
      resolve: function resolve(template) {
        template = this.normalize(template);
        return this.resolver(template, this).then(function (content) {
          return this.process(content, template);
        }.bind(this));
      },
      process: function process(content, template) {
        var extension = template.split('.').pop();

        if (this.module.indexOf(extension) > -1) {
          content = [this.token.start, content, this.token.end].join('\n');
        }

        return content;
      },
      get: function get(path) {
        var template = this.extension(path);

        if (this.cache.exist(template)) {
          return this.cache.resolve(template);
        }

        var content = this.resolve(template).then(function (content) {
          content = this.compiler.compile(content, template);
          return this.result(content, template);
        }.bind(this));
        return this.result(content, template);
      },
      result: function result(content, template) {
        this.cache.set(template, content);
        return content;
      }
    };

    function configure(options) {
      /**
       * @extends defaults
       */
      var config = extend({
        loader: {},
        extension: {},
        token: {},
        vars: {}
      }, defaults, options || {}); //

      var Scope = configure$1(config); //

      var compiler = new Compiler(config);

      var _wrapper = new Wrapper(config);

      var loader = new Loader(config, compiler); //

      function template(path, defaultExt) {
        var ext = path.split('.').pop();

        if (config.extension.supported.indexOf(ext) === -1) {
          path = [path, defaultExt].join('.');
        }

        return path;
      } //


      function output(path, scope) {
        return loader.get(path).then(function (template) {
          return template.call(scope, scope, scope.getBuffer(), safeValue);
        });
      } //


      function render(name, data) {
        var view = template(name, config.extension["default"]);
        var scope = new Scope(data);
        return output(view, scope).then(function (content) {
          if (scope.getExtend()) {
            scope.setExtend(false);
            var layout = scope.getLayout();

            var _data = scope.clone();

            return render(layout, _data);
          }

          return content;
        });
      } //


      function require(name) {
        var view = template(name, config.extension.module);
        this.exports = {};
        this.module = this;
        return output(view, this).then(function () {
          return this.exports;
        }.bind(this));
      } //


      var expressInstance = null; //

      function express(name, options, callback) {
        if (isFunction(options)) {
          callback = options;
          options = {};
        }

        options = options || {};
        var settings = options.settings || {};
        var viewPath = settings['views'];
        var viewOptions = settings['view options'] || {};
        var filename = path.relative(viewPath, name);

        if (expressInstance === null) {
          expressInstance = configure(viewOptions);
        }

        return expressInstance.render(filename, options).then(function (content) {
          callback(null, content);
        })["catch"](function (error) {
          callback(error);
        });
      } //


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
        render: render
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
        compile: function compile(text, path) {
          return compiler.compile(text, path);
        },

        /**
         *
         * @param list
         * @return {string}
         */
        wrapper: function wrapper(list) {
          return _wrapper.browser(list);
        },

        /**
         *
         * @param methods
         */
        helpers: function helpers(methods) {
          extend(Scope.prototype, methods || {});
        },

        /**
         *  Configure EJS
         */
        configure: configure,

        /**
         *
         */
        __express: express
      };
    }

    var index = configure({});

    return index;

})();
