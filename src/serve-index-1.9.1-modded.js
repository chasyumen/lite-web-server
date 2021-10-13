/*!
* serve-index
* Copyright(c) 2011 Sencha Inc.
* Copyright(c) 2011 TJ Holowaychuk
* Copyright(c) 2014-2015 Douglas Christopher Wilson
* MIT Licensed
* 
* Modified by chasyumen (2021)
*/

'use strict'

var fs = require('fs')
    , path = require('path')
    , normalize = path.normalize
    , sep = path.sep
    , extname = path.extname
    , join = path.join;
var resolve = require('path').resolve;
var parseUrl = require("./util/parseurl-1.3.3.js");
var Batch = require('./util/batch-0.6.1.js');
var mime = require('./mime-types/index.js');
var escapeHtml = require("./util/escape-html-1.0.3.js");

module.exports = serveIndex;

/*!
* Icon cache.
*/

var cache = {};

/*!
* Default template.
*/

var defaultTemplate = join(__dirname, '..', '..', 'assets', 'serve-index', 'directory.html');

/*!
* Stylesheet.
*/

var defaultStylesheet = join(__dirname, '..', '..', 'assets', 'serve-index', 'style.css');

/**
* Media types and the map for content negotiation.
*/

var mediaTypes = [
    'text/html',
    'text/plain',
    'application/json'
];

var mediaType = {
    'text/html': 'html',
    'text/plain': 'plain',
    'application/json': 'json'
};

function serveIndex(root, options) {
    var opts = options || {};

    // root required
    if (!root) {
        throw new TypeError('serveIndex() root path required');
    }

    // resolve root to absolute and normalize
    var rootPath = normalize(resolve(root) + sep);

    var filter = opts.filter;
    var hidden = opts.hidden;
    var icons = opts.icons;
    var stylesheet = opts.stylesheet || defaultStylesheet;
    var template = opts.template || defaultTemplate;
    var view = opts.view || 'tiles';

    async function onrequest(req, res) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            //res.statusCode = 'OPTIONS' === req.method ? 200 : 405;
            //res.setHeader('Allow', 'GET, HEAD, OPTIONS');
            //res.setHeader('Content-Length', '0');
            //res.end();
            return false;
        }

        // get dir
        var dir = getRequestedDir(req);

        // bad request
        if (dir === null) throw new Error("directory not found.");

        // parse URLs
        var originalUrl = parseUrl.original(req);
        var originalDir = decodeURIComponent(originalUrl.pathname);

        // join / normalize from root dir
        var path = normalize(join(rootPath, dir));

        // null byte(s), bad request
        if (~path.indexOf('\0')) throw new Error("Error");

        // malicious path
        if ((path + sep).substr(0, rootPath.length) !== rootPath) {
            //debug('malicious path "%s"', path);
            throw new Error("Error");
        }

        // determine ".." display
        var showUp = normalize(resolve(path) + sep) !== rootPath;

        // check if we have a directory
        //debug('stat "%s"', path);
        try {

            var stat = await fs.statSync(path);
            /*if (err && err.code === 'ENOENT') {
                throw new Error(err);
            }
   
            if (err) {
                err.status = err.code === 'ENAMETOOLONG'
                    ? 414
                    : 500;
                throw new Error(err);
            }*/

            if (!stat.isDirectory()) throw new Error("Error");

            // fetch files
            //debug('readdir "%s"', path);
            var _path = path.replace(/\/../g, "");
            fs.readdir(_path, function (err, files) {
                if (err) return false;
                if (!hidden) files = removeHidden(files);
                if (filter) files = files.filter(function (filename, index, list) {
                    return filter(filename, index, list, path);
                });
                files.sort();

                // content-negotiation
                //var accept = accepts(req);
                //var type = accept.type(mediaTypes);

                // not acceptable
                //if (!type) return false;
                return serveIndex[mediaType["text/html"]](req, res, files, null, originalDir, showUp, icons, path, view, template, stylesheet);
            });
        } catch (error) {
            return false;
            throw new Error(error)
        }


    };
    return onrequest;
};

serveIndex.html = function _html(req, res, files, next, dir, showUp, icons, path, view, template, stylesheet) {
    var render = typeof template !== 'function'
        ? createHtmlRender(template)
        : template

    if (showUp) {
        files.unshift('..');
    }

    // stat all files
    stat(path, files, function (err, fileList) {
        if (err) return false;

        // sort file list
        fileList.sort(fileSort);

        // read stylesheet
        fs.readFile(stylesheet, 'utf8', function (err, style) {
            if (err) return false;

            // create locals for rendering
            var locals = {
                directory: dir,
                displayIcons: Boolean(icons),
                fileList: fileList,
                path: path,
                style: style,
                viewName: view
            };

            // render html
            render(locals, function (err, body) {
                if (err) return false;
                return send(res, 'text/html', body)
            });
        });
    });
};

function fileSort(a, b) {
    // sort ".." to the top
    if (a.name === '..' || b.name === '..') {
        return a.name === b.name ? 0
            : a.name === '..' ? -1 : 1;
    }

    return Number(b.stat && b.stat.isDirectory()) - Number(a.stat && a.stat.isDirectory()) ||
        String(a.name).toLocaleLowerCase().localeCompare(String(b.name).toLocaleLowerCase());
}

function getRequestedDir(req) {
    try {
        return decodeURIComponent(parseUrl(req).pathname);
    } catch (e) {
        return null;
    }
}

function createHtmlRender(template) {
    return function render(locals, callback) {
        // read template
        fs.readFile(template, 'utf8', function (err, str) {
            if (err) return callback(err);

            var body = str
                .replace(/\{style\}/g, locals.style.concat(iconStyle(locals.fileList, locals.displayIcons)))
                .replace(/\{files\}/g, createHtmlFileList(locals.fileList, locals.directory, locals.displayIcons, locals.viewName))
                .replace(/\{directory\}/g, escapeHtml(locals.directory))
                .replace(/\{linked-path\}/g, htmlPath(locals.directory));

            callback(null, body);
        });
    };
}

function iconStyle(files, useIcons) {
    if (!useIcons) return '';
    var i;
    var list = [];
    var rules = {};
    var selector;
    var selectors = {};
    var style = '';

    for (i = 0; i < files.length; i++) {
        var file = files[i];

        var isDir = file.stat && file.stat.isDirectory();
        var icon = isDir
            ? { className: 'icon-directory', fileName: icons.folder }
            : iconLookup(file.name);
        var iconName = icon.fileName;

        selector = '#files .' + icon.className + ' .name';

        if (!rules[iconName]) {
            rules[iconName] = 'background-image: url(data:image/png;base64,' + load(iconName) + ');'
            selectors[iconName] = [];
            list.push(iconName);
        }

        if (selectors[iconName].indexOf(selector) === -1) {
            selectors[iconName].push(selector);
        }
    }

    for (i = 0; i < list.length; i++) {
        iconName = list[i];
        style += selectors[iconName].join(',\n') + ' {\n  ' + rules[iconName] + '\n}\n';
    }

    return style;
}

function load(icon) {
    if (cache[icon]) return cache[icon];
    return cache[icon] = JSON.parse(fs.readFileSync(__dirname + '/../../assets/serve-index/icons.json'))[icon]
}

function iconLookup(filename) {
    var ext = extname(filename);

    // try by extension
    if (icons[ext]) {
        return {
            className: 'icon-' + ext.substring(1),
            fileName: icons[ext]
        };
    }

    var mimetype = mime.lookup(ext);

    // default if no mime type
    if (mimetype === false) {
        return {
            className: 'icon-default',
            fileName: icons.default
        };
    }

    // try by mime type
    if (icons[mimetype]) {
        return {
            className: 'icon-' + mimetype.replace('/', '-').replace('+', '_'),
            fileName: icons[mimetype]
        };
    }

    var suffix = mimetype.split('+')[1];

    if (suffix && icons['+' + suffix]) {
        return {
            className: 'icon-' + suffix,
            fileName: icons['+' + suffix]
        };
    }

    var type = mimetype.split('/')[0];

    // try by type only
    if (icons[type]) {
        return {
            className: 'icon-' + type,
            fileName: icons[type]
        };
    }

    return {
        className: 'icon-default',
        fileName: icons.default
    };
}

function normalizeSlashes(path) {
    return path.split(sep).join('/');
};

function htmlPath(dir) {
    var parts = dir.split('/');
    var crumb = new Array(parts.length);

    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];

        if (part) {
            parts[i] = encodeURIComponent(part);
            crumb[i] = '<a href="' + escapeHtml(parts.slice(0, i + 1).join('/')) + '">' + escapeHtml(part) + '</a>';
        }
    }

    return crumb.join(' / ');
}

function createHtmlFileList(files, dir, useIcons, view) {
    var html = '<ul id="files" class="view-' + escapeHtml(view) + '">'
        + (view === 'details' ? (
            '<li class="header">'
            + '<span class="name">Name</span>'
            + '<span class="size">Size</span>'
            + '<span class="date">Modified</span>'
            + '</li>') : '');

    html += files.map(function (file) {
        var classes = [];
        var isDir = file.stat && file.stat.isDirectory();
        var path = dir.split('/').map(function (c) { return encodeURIComponent(c); });

        if (useIcons) {
            classes.push('icon');

            if (isDir) {
                classes.push('icon-directory');
            } else {
                var ext = extname(file.name);
                var icon = iconLookup(file.name);

                classes.push('icon');
                classes.push('icon-' + ext.substring(1));

                if (classes.indexOf(icon.className) === -1) {
                    classes.push(icon.className);
                }
            }
        }

        path.push(encodeURIComponent(file.name));

        var date = file.stat && file.name !== '..'
            ? file.stat.mtime.toLocaleDateString() + ' ' + file.stat.mtime.toLocaleTimeString()
            : '';
        var size = file.stat && !isDir
            ? file.stat.size
            : '';

        return '<li><a href="'
            + escapeHtml(normalizeSlashes(normalize(path.join('/'))))
            + '" class="' + escapeHtml(classes.join(' ')) + '"'
            + ' title="' + escapeHtml(file.name) + '">'
            + '<span class="name">' + escapeHtml(file.name) + '</span>'
            + '<span class="size">' + escapeHtml(size) + '</span>'
            + '<span class="date">' + escapeHtml(date) + '</span>'
            + '</a></li>';
    }).join('\n');

    html += '</ul>';

    return html;
}

function send(res, type, body) {
    // security header for content sniffing
    //return body;
    //console.log(body)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    // standard headers
    res.setHeader('Content-Type', type + '; charset=utf-8')
    res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'))

    // body
    res.end(body, 'utf8')
}

function removeHidden(files) {
    return files.filter(function (file) {
        return file[0] !== '.'
    });
}

function stat(dir, files, cb) {
    var batch = new Batch();

    batch.concurrency(10);

    files.forEach(function (file) {
        batch.push(function (done) {
            fs.stat(join(dir, file), function (err, stat) {
                if (err && err.code !== 'ENOENT') return done(err);

                // pass ENOENT as null stat, not error
                done(null, {
                    name: file,
                    stat: stat || null
                })
            });
        });
    });

    batch.end(cb);
}

var icons = {
    // base icons
    'default': 'page_white',
    'folder': 'folder',

    // generic mime type icons
    'font': 'font',
    'image': 'image',
    'text': 'page_white_text',
    'video': 'film',

    // generic mime suffix icons
    '+json': 'page_white_code',
    '+xml': 'page_white_code',
    '+zip': 'box',

    // specific mime type icons
    'application/javascript': 'page_white_code_red',
    'application/json': 'page_white_code',
    'application/msword': 'page_white_word',
    'application/pdf': 'page_white_acrobat',
    'application/postscript': 'page_white_vector',
    'application/rtf': 'page_white_word',
    'application/vnd.ms-excel': 'page_white_excel',
    'application/vnd.ms-powerpoint': 'page_white_powerpoint',
    'application/vnd.oasis.opendocument.presentation': 'page_white_powerpoint',
    'application/vnd.oasis.opendocument.spreadsheet': 'page_white_excel',
    'application/vnd.oasis.opendocument.text': 'page_white_word',
    'application/x-7z-compressed': 'box',
    'application/x-sh': 'application_xp_terminal',
    'application/x-msaccess': 'page_white_database',
    'application/x-shockwave-flash': 'page_white_flash',
    'application/x-sql': 'page_white_database',
    'application/x-tar': 'box',
    'application/x-xz': 'box',
    'application/xml': 'page_white_code',
    'application/zip': 'box',
    'image/svg+xml': 'page_white_vector',
    'text/css': 'page_white_code',
    'text/html': 'page_white_code',
    'text/less': 'page_white_code',

    // other, extension-specific icons
    '.accdb': 'page_white_database',
    '.apk': 'box',
    '.app': 'application_xp',
    '.as': 'page_white_actionscript',
    '.asp': 'page_white_code',
    '.aspx': 'page_white_code',
    '.bat': 'application_xp_terminal',
    '.bz2': 'box',
    '.c': 'page_white_c',
    '.cab': 'box',
    '.cfm': 'page_white_coldfusion',
    '.clj': 'page_white_code',
    '.cc': 'page_white_cplusplus',
    '.cgi': 'application_xp_terminal',
    '.cpp': 'page_white_cplusplus',
    '.cs': 'page_white_csharp',
    '.db': 'page_white_database',
    '.dbf': 'page_white_database',
    '.deb': 'box',
    '.dll': 'page_white_gear',
    '.dmg': 'drive',
    '.docx': 'page_white_word',
    '.erb': 'page_white_ruby',
    '.exe': 'application_xp',
    '.fnt': 'font',
    '.gam': 'controller',
    '.gz': 'box',
    '.h': 'page_white_h',
    '.ini': 'page_white_gear',
    '.iso': 'cd',
    '.jar': 'box',
    '.java': 'page_white_cup',
    '.jsp': 'page_white_cup',
    '.lua': 'page_white_code',
    '.lz': 'box',
    '.lzma': 'box',
    '.m': 'page_white_code',
    '.map': 'map',
    '.msi': 'box',
    '.mv4': 'film',
    '.pdb': 'page_white_database',
    '.php': 'page_white_php',
    '.pl': 'page_white_code',
    '.pkg': 'box',
    '.pptx': 'page_white_powerpoint',
    '.psd': 'page_white_picture',
    '.py': 'page_white_code',
    '.rar': 'box',
    '.rb': 'page_white_ruby',
    '.rm': 'film',
    '.rom': 'controller',
    '.rpm': 'box',
    '.sass': 'page_white_code',
    '.sav': 'controller',
    '.scss': 'page_white_code',
    '.srt': 'page_white_text',
    '.tbz2': 'box',
    '.tgz': 'box',
    '.tlz': 'box',
    '.vb': 'page_white_code',
    '.vbs': 'page_white_code',
    '.xcf': 'page_white_picture',
    '.xlsx': 'page_white_excel',
    '.yaws': 'page_white_code'
};
