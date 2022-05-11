const config = {
    escape: /<%-([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    evaluate: /<%([\s\S]+?)%>/g,
};

const noMatch = /(.)^/;

const matcher = new RegExp([
    (config.escape || noMatch).source,
    (config.interpolate || noMatch).source,
    (config.evaluate || noMatch).source
].join('|') + '|$', 'g')

const regexpObject = (obj) => {
    return new RegExp(['[', Object.keys(obj).join(''), ']'].join(''), 'g');
}

const symbolEntities = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
};

const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;'
};

const symbolEntitiesRegexp = regexpObject(symbolEntities);
const htmlEntitiesRegexp = regexpObject(htmlEntities);

const entities = (string) => {
    return ('' + string).replace(htmlEntitiesRegexp, function (match) {
        return htmlEntities[match];
    });
};


const safe = (value,escape,check) => {
    return ( check = value ) == null ? '' : escape ? entities(check) : check
}

const symbols = (string) => {
    return ('' + string).replace(symbolEntitiesRegexp, function (match) {
        return '\\' + symbolEntities[match]
    });
}

const compile = (text, path) => {
    let result = null;
    let ext = path.split('.').pop()
    let index = 0;
    if (ext === 'mjs') {
        text = ['<%', text, '%>'].join('\n');
    }
    let source = "$$i+='";
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
        source += symbols(text.slice(index, offset));
        if (escape) {
            source += "'+\n$$v(" + escape + ",1)+\n'";
        }
        if (interpolate) {
            source += "'+\n$$v(" + interpolate + ")+\n'";
        }
        if (evaluate) {
            source += "'\n" + evaluate + "\n$$i+='";
        }
        index = offset + match.length;
        return match;
    });
    source += "';\n";
    source = 'with(o||{}){\n' + source + '}\n';
    source = "var $$i=''\n" +
        "function $$m(c){return function(){$$i='';c.apply(null,arguments);return $$i} }\n" +
        "function $$j(){$$i+=[].join.call(arguments,'')}\n" +
        "this.$$m = $$m\n" +
        source + "return $$i;\n";
    try {
        result = new Function('o','$$v',source);
        result.source = '(function(o,$$v){\n' + source + '\n})';
    } catch (e) {
        e.filename = path
        e.source = source;
        throw e;
    }
    return result;
};

const wrapper = (name, list) => {
    let out = '(function(o){\n';
    list.forEach(item => {
        out += 'o[' + JSON.stringify(item.name) + ']=' + String(item.content) + '\n';
    });
    out += '})(window.' + name + ' = window.' + name + ' || {});\n';
    return out;
}

export {
    entities,
    compile,
    wrapper,
    safe
}


