var xml2js = require('xml2js');

var fs = require('fs');

var x2js = new xml2js.Parser({
    attrkey: '$',
    charkey: 'value',
    trim: true,
    normalize: true,
    normalizeTags: false,
    explicitRoot: false,
    explicitArray: false,
    attrNameProcessors: [function (name) { return "$" + name }],
    mergeAttrs: true,
    async: false
});

var xmlStr = fs.readFileSync('./config.xml', 'utf-8')
x2js.parseString(xmlStr, function (e, jsonObj) {
    jsonObj = _simplify(jsonObj);
    var contents = JSON.stringify(jsonObj, null, 4);
    console.log(contents);
    fs.writeFileSync('config.json', contents, 'utf-8');
    setTimeout(process.exit, 1)
})

var x2js2 = new xml2js.Builder({
    attrkey: '$',
    charkey: 'value',
    trim: true,
    normalize: true,
    normalizeTags: false,
    explicitRoot: false,
    explicitArray: false,
    mergeAttrs: true
});

var jsonObj = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
jsonObj = _unsimplify(jsonObj);
jsonObj = render(jsonObj);
var contents = x2js2.buildObject(jsonObj);
console.log(contents);
fs.writeFileSync('config2.xml', contents, 'utf-8');

function render(obj) {
    var attr, child, entry, index, key, value;
    if (typeof obj !== 'object') {
        return obj;
    } else {
        for (key in obj) {
            if (!Object.hasOwnProperty.call(obj, key)) continue;
            child = obj[key];
            if (key.startsWith('$')) {
                obj['$'] = obj['$'] || {};
                obj['$'][key.substr(1)] = render(child);
                delete obj[key];
            } else
                obj[key] = render(child)
        }
        return obj;
    };
}



function _simplify(obj) {
    var ATTRIBUTES = ['href', 'email', 'src', 'id', 'version', 'origin', 'xmlns']
    var SINGLETONS = ['allow-intent']
    var NAMEVALUES = ['preference']

    var SINGLETONS_DECODE = {'allow-intent': '$href'}
    var attr, child, entry, index, key, value;
    if (typeof obj !== 'object') {
        return obj;
    } else {
        for (key in obj) {
            if (!Object.hasOwnProperty.call(obj, key)) continue;

            child = obj[key];
            if (key.startsWith('$') && ATTRIBUTES.includes(key.substr(1))) {
                obj[key.substr(1)] = _simplify(child);
                delete obj[key];
            } else if (SINGLETONS.includes(key)) {
                var decode = SINGLETONS_DECODE[key];
                var singletonresult = [];
                 for (index in child) {
                        if (!Object.hasOwnProperty.call(child, index)) continue;
                        entry = child[index];
                        singletonresult.push(entry[decode])
                      
                    }
                delete obj[key];
                obj[key] =singletonresult;
            } else if (NAMEVALUES.includes(key)) {
                var namevalueresult = {};
                 for (index in child) {
                        if (!Object.hasOwnProperty.call(child, index)) continue;
                        entry = child[index];
                        namevalueresult[entry['$name']] = entry['$value'];      
                    }
                delete obj[key];
                obj[key] =namevalueresult;
            } else {
                if (Array.isArray(child)) {
                    for (index in child) {
                        if (!Object.hasOwnProperty.call(child, index)) continue;
                        entry = child[index];
                        if (typeof entry === 'string') {
                            // no change
                        } else {
                            child[index] = _simplify(entry);
                        }
                    }
                } else if (typeof child === "object") {
                    delete obj[key];
                    obj[key] = _simplify(child)
                } else {
                    entry = obj[key];
                    delete obj[key];
                    obj[key] = entry;
                }
            }
        }

        return obj;
    };
}

function _unsimplify(obj) {
    var ATTRIBUTES = ['href', 'email', 'src', 'id', 'version', 'origin', 'xmlns']
    var attr, child, entry, index, key, value;
    if (typeof obj !== 'object') {
        return obj;
    } else {
        for (key in obj) {
            if (!Object.hasOwnProperty.call(obj, key)) continue;

            child = obj[key];
            if (ATTRIBUTES.includes(key)) {
                obj['$' + key] = _unsimplify(child);
                delete obj[key];
            } else {
                if (Array.isArray(child)) {
                    for (index in child) {
                        if (!Object.hasOwnProperty.call(child, index)) continue;
                        entry = child[index];
                        if (typeof entry === 'string') {
                            // no change
                        } else {
                            child[index] = _unsimplify(entry);
                        }
                    }
                } else if (typeof child === "object") {
                    obj[key] = _unsimplify(child)
                } else {
                    // no change for string etc
                }
            }
        }

        return obj;
    };
}


function _render(obj) {
    var attr, child, entry, index, key, value;
    if (typeof obj !== 'object') {
        return obj;
    } else {
        for (key in obj) {
            if (!Object.hasOwnProperty.call(obj, key)) continue;

            child = obj[key];

            if (key.startsWith('$')) {
                obj['$'] = obj['$'] || {};
                obj['$'][key.substr(1)] = _render(child);
                delete obj[key];
            } else {
                if (Array.isArray(child)) {
                    for (index in child) {
                        if (!Object.hasOwnProperty.call(child, index)) continue;
                        entry = child[index];
                        if (typeof entry === 'string') {
                            // no change
                        } else {
                            child[index] = _render(entry);
                        }
                    }
                } else if (typeof child === "object") {
                    obj[key] = _render(child)
                } else {
                    // no change for string etc
                }
            }
        }

        return obj;
    };
}


function Simplify(rootObj) {
    var attrkey, charkey, render, rootElement, rootName;
    attrkey = this.options.attrkey;
    charkey = this.options.charkey;
    if ((Object.keys(rootObj).length === 1)) {
        rootName = Object.keys(rootObj)[0];
        rootObj = rootObj[rootName];
    } else {
        rootName = 'widget';
    }
    render = (function (_this) {
        return function (element, obj) {
            var attr, child, entry, index, key, value;
            if (typeof obj !== 'object') {
                element.txt(obj);
            } else {
                for (key in obj) {
                    if (!hasProp.call(obj, key)) continue;
                    child = obj[key];
                    if (key === attrkey) {
                        if (typeof child === "object") {
                            for (attr in child) {
                                value = child[attr];
                                element = element.att(attr, value);
                            }
                        }
                    } else if (key === charkey) {
                        if (_this.options.cdata && requiresCDATA(child)) {
                            element = element.raw(wrapCDATA(child));
                        } else {
                            element = element.txt(child);
                        }
                    } else if (Array.isArray(child)) {
                        for (index in child) {
                            if (!hasProp.call(child, index)) continue;
                            entry = child[index];
                            if (typeof entry === 'string') {
                                if (_this.options.cdata && requiresCDATA(entry)) {
                                    element = element.ele(key).raw(wrapCDATA(entry)).up();
                                } else {
                                    element = element.ele(key, entry).up();
                                }
                            } else {
                                element = render(element.ele(key), entry).up();
                            }
                        }
                    } else if (typeof child === "object") {
                        element = render(element.ele(key), child).up();
                    } else {
                        if (typeof child === 'string' && _this.options.cdata && requiresCDATA(child)) {
                            element = element.ele(key).raw(wrapCDATA(child)).up();
                        } else {
                            if (child == null) {
                                child = '';
                            }
                            element = element.ele(key, child.toString()).up();
                        }
                    }
                }
            }
            return element;
        };
    })(this);
    rootElement = builder.create(rootName, this.options.xmldec, this.options.doctype, {
        headless: this.options.headless,
        allowSurrogateChars: this.options.allowSurrogateChars
    });
    return render(rootElement, rootObj).end(this.options.renderOpts);
};

