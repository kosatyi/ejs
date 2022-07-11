(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('path'), require('fs'), require('chokidar')) :
	typeof define === 'function' && define.amd ? define(['path', 'fs', 'chokidar'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ejs = factory(global.path, global.fs, global.chokidar));
})(this, (function (require$$0$1, require$$0, require$$1) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var require$$0__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
	var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
	var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var defaults$1 = {};
	defaults$1["export"] = 'ejs.precompiled';
	defaults$1.path = 'views';
	defaults$1.resolver = null;
	defaults$1.extension = {
	  supported: ['ejs', 'js', 'html', 'svg', 'css'],
	  "default": 'ejs',
	  module: 'js'
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
	  SAFE: '$$v'
	};
	defaults$1.token = {
	  start: '<%',
	  end: '%>',
	  regex: '([\\s\\S]+?)'
	};
	var defaults_1 = defaults$1;

	var utils = {};
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

	utils.entities = function () {
	  var string = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	  return ('' + string).replace(htmlEntitiesMatch, function (match) {
	    return htmlEntities[match];
	  });
	};

	utils.symbols = function (string) {
	  return ('' + string).replace(symbolEntitiesMatch, function (match) {
	    return '\\' + symbolEntities[match];
	  });
	};

	utils.safeValue = function (value, escape, check) {
	  return (check = value) == null ? '' : escape ? utils.entities(check) : check;
	};

	utils.getPath = function (context, name) {
	  var data = context;
	  var chunk = name.split('.');
	  var prop = chunk.pop();
	  chunk.forEach(function (part) {
	    data = data[part] = data[part] || {};
	  });
	  return [data, prop];
	};

	utils.assign = function (list) {
	  var sources = (list || [null]).map(function (source) {
	    return source || {};
	  });
	  return {
	    target: sources.shift(),
	    sources: sources
	  };
	};

	utils.isPromise = function (p) {
	  return Boolean(p && typeof p.then === 'function');
	};

	utils.merge = function (target) {
	  return [].slice.call(arguments, 1).filter(function (source) {
	    return source;
	  }).reduce(function (target, source) {
	    return Object.assign(target, source);
	  }, target);
	};

	utils.extend = function (target) {
	  return [].slice.call(arguments, 1).filter(function (source) {
	    return source;
	  }).reduce(function (target, source) {
	    return Object.assign(target, source);
	  }, target);
	};

	utils.noop = function () {};

	utils.format = function (pattern, params) {
	  pattern = pattern || '';
	  params = params || {};
	  return pattern.replace(/\${(.+?)}/g, function (match, prop) {
	    return utils.hasProp(params, prop) ? params[prop] : match;
	  });
	};

	utils.each = function (object, callback, context) {
	  var prop;

	  for (prop in object) {
	    if (utils.hasProp(object, prop)) {
	      callback.call(context || null, object[prop], prop, object);
	    }
	  }
	};

	utils.map = function (object, callback, context) {
	  var result = [];
	  utils.each(object, function (value, key, object) {
	    var item = callback.call(this, value, key, object);

	    if (item !== undefined) {
	      result.push(item);
	    }
	  }, context);
	  return result;
	};

	utils.filter = function (object, callback, context) {
	  var isArray = object instanceof Array;
	  var result = isArray ? [] : {};
	  utils.each(object, function (value, key, object) {
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

	utils.omit = function (object, list) {
	  return utils.filter(object, function (value, key) {
	    if (list.indexOf(key) === -1) {
	      return value;
	    }
	  });
	};

	utils.uuid = function (str) {
	  var i = str.length;
	  var hash1 = 5381;
	  var hash2 = 52711;

	  while (i--) {
	    var _char = str.charCodeAt(i);

	    hash1 = hash1 * 33 ^ _char;
	    hash2 = hash2 * 33 ^ _char;
	  }

	  return (hash1 >>> 0) * 4096 + (hash2 >>> 0);
	};

	utils.random = function (size) {
	  var string = '';
	  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
	  var limit = chars.length;
	  var length = size || 10;

	  for (var i = 0; i < length; i++) {
	    string += chars.charAt(Math.floor(Math.random() * limit));
	  }

	  return string;
	};

	utils.hasProp = function (object, prop) {
	  return object && object.hasOwnProperty(prop);
	};

	var utils_1 = utils;

	var type = {};

	type.isFunction = function (v) {
	  return typeof v === 'function';
	};

	type.isString = function (v) {
	  return typeof v === 'string';
	};

	var type_1 = type;

	var entities = utils_1.entities,
	    map = utils_1.map;
	var selfClosed = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
	var space = ' ';
	var quote = '"';
	var equal = '=';
	var slash = '/';
	var lt = '<';
	var gt = '>';

	function element$1(tag, attrs, content) {
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

	var element_1 = element$1;

	function resolve(list) {
	  return Promise.all(list).then(function (list) {
	    return list.join('');
	  });
	}
	/**
	 *
	 * @return {function}
	 */


	function Buffer$1() {
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

	var buffer = Buffer$1;

	var extend$3 = utils_1.extend;
	var element = element_1;
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
	  element: element,
	  render: function render(props) {
	    return this.create(extend$3({}, this.props, props));
	  }
	};
	/**
	 *  @type {function}
	 */

	var component = Component$1;

	var extend$2 = utils_1.extend,
	    omit = utils_1.omit,
	    _each = utils_1.each,
	    getPath = utils_1.getPath,
	    hasProp$1 = utils_1.hasProp,
	    noop = utils_1.noop;
	var isFunction$1 = type_1.isFunction,
	    isString = type_1.isString;
	var _element = element_1;
	var Buffer = buffer;
	var Component = component;

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
	    extend$2(this, data);
	    this.setBuffer();
	    this.setLayout(false);
	    this.setExtend(false);
	  }

	  Scope.helpers = function (methods) {
	    extend$2(Scope.prototype, methods);
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

	        if (isFunction$1(callback)) {
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
	    node: _element,

	    /**
	     * @memberOf global
	     */
	    element: function element(tag, attr, content) {
	      if (isFunction$1(content)) {
	        content = this.macro(content)();
	      }

	      this.echo(this.resolve(content, function (content) {
	        return _element(tag, attr, content);
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
	      return hasProp$1(result, prop) ? result[prop] : defaults;
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
	        if (hasProp$1(result, prop)) {
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

	      if (isFunction$1(result[prop])) {
	        return result[prop].apply(result, params);
	      }
	    },

	    /**
	     * @memberOf global
	     * @param object
	     * @param callback
	     */
	    each: function each(object, callback) {
	      if (isString(object)) {
	        object = this.get(object, []);
	      }

	      _each(object, callback, this);
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
	      var params = extend$2(cx ? this.clone(true) : {}, data);
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

	var scope = configure$1;

	var symbols = utils_1.symbols;
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

	function Compiler$1(config) {
	  this.setup(config);
	}

	Compiler$1.prototype = {
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
	var compiler = Compiler$1;

	function Wrapper$1(config) {
	  this.configure(config);
	}

	Wrapper$1.prototype = {
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
	var wrapper = Wrapper$1;

	var extend$1 = utils_1.extend,
	    hasProp = utils_1.hasProp;

	function Cache$1(config) {
	  this.list = {};
	  this.enabled = config.cache || false;
	  this.namespace = config["export"];
	  this.preload();
	}

	Cache$1.prototype = {
	  exist: function exist(key) {
	    return hasProp(this.list, key);
	  },
	  get: function get(key) {
	    return this.list[key];
	  },
	  remove: function remove(key) {
	    delete this[key];
	  },
	  resolve: function resolve(key) {
	    return Promise.resolve(this.get(key));
	  },
	  set: function set(key, value) {
	    this.list[key] = value;
	  },
	  preload: function preload() {
	    extend$1(this.list, commonjsGlobal[this.namespace]);
	  },
	  load: function load(list) {
	    extend$1(this.list, list);
	  }
	};
	var cache = Cache$1;

	var fs = require$$0__default["default"];
	var chokidar = require$$1__default["default"];
	var Cache = cache;
	var isNode = new Function('try {return this===global;}catch(e){return false;}');

	function HttpRequest(template) {
	  return window.fetch(template).then(function (response) {
	    return response.text();
	  });
	}

	function FileSystem(template) {
	  return new Promise(function (resolve, reject) {
	    fs.readFile(template, function (error, data) {
	      if (error) {
	        reject(error);
	      } else {
	        resolve(data.toString());
	      }
	    });
	  });
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
	  this["default"] = config.extension["default"];
	  this.supported = config.extension.supported || [];
	  this.supported.push(this.module);
	  this.supported.push(this["default"]);

	  if (config.watch && isNode()) {
	    this.watch();
	  }
	}

	Loader$1.prototype = {
	  watch: function watch() {
	    this.watcher = chokidar.watch('.', {
	      cwd: this.path
	    });
	    this.watcher.on('change', function (ev, name) {
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
	var loader = Loader$1;

	var path = require$$0__default$1["default"];
	var defaults = defaults_1;
	var extend = utils_1.extend,
	    safeValue = utils_1.safeValue;
	var isFunction = type_1.isFunction;
	var ConfigureScope = scope;
	var Compiler = compiler;
	var Wrapper = wrapper;
	var Loader = loader;

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

	  var Scope = ConfigureScope(config); //

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


	  function output(path, scope, options) {
	    return loader.get(path, options).then(function (template) {
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


	  function express(name, options, callback) {
	    if (isFunction(options)) {
	      callback = options;
	      options = {};
	    }

	    options = options || {};
	    var settings = options.settings || {};
	    var filename = path.relative(settings['views'], name);
	    return render(filename, options).then(function (content) {
	      callback(null, content);
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

	var src = configure({});

	return src;

}));
