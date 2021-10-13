/*
    lite-web-server
    Copyright (c) 2021 chasyumen
    MIT Licensed
*/

'use strict'


const http = require('http');
const path = require('path');
const fs = require("fs");
const EventEmitter = require('events').EventEmitter;
const GetFileType = require("./GetFileType/index.js");
const serveIndex = require("./serve-index-1.9.1-modded.js");
const safeurl = require("./safe-url.js");

const Events = {
  DEBUG: "debug",
  REQUEST: "request",
  REQUEST_LOG: "log"
}; // extends EventEmitter

/**
 * WebServer's options.
 * @typedef WebServerOptions
 * @type {object}
 * @property {object} [options]
 * @property {Number} [options.port=3000] - Port to host the page.
 * @property {string} [options.directory=./public/] - The directory to load the file. 
 * @property {boolean} [options.serveindex=false] - If it's true, return the file list of the directory when the directory was requested. (If index.html exists in the directory, it will be sent preferentially)
 * @property {boolean} [options.acceptonlyget=true] - Only accepts get request.
 * @property {boolean} [options.useindexhtml=true] - If it's true, returns ./index.html file when requested directory.
 * @property {string} [options.rootfile=/index.html] - You can specify a file to load as a top page. (Please specify files in the published directory.)
 * @property {object} [options.errordocument]
 * @property {string} [options.errordocument._404=`${__dirname}/assets/def_pages/404.html`] - Html file path to respond on the request methods other than GET.
 * @property {string} [options.errordocument._405=`${__dirname}/assets/def_pages/405.html`] - Html file path to respond on not found.
 * @example <caption>All Options Example</caption>
 * const { WebServer } = require("lite-web-server");
 * var server = new WebServer({
 *   port: 3000, //port
 *   directory: "./public", //directory to publish
 *   serveindex: false, //disable serve-Index feature.
 *   acceptonlyget: true, //returns 405 to the request with method other than GET.
 *   useindexhtml: true, //returns /index.html on that directory when the directory was requested.
 *   rootfile: "/index.html", //the file that is used as the home page.
 *   errordocument: {
 *     _404: `./public/404.html`, //File path to use as a 404 error page.
 *     _405: `./public/405.html`, //File path to use as a 405 error page.
 *   }
 * });
 */

/**
 * Create a WebServer.
 * @constructor
 * @param {WebServerOptions} [options] - WebServer Options.
 * @returns {WebServer} 
 * @example <caption>Simple example</caption>
 * const { WebServer } = require("lite-web-server");
 * var server = new WebServer();
 * 
 * server.start();
 * @example <caption>Options Example</caption>
 * const { WebServer } = require("lite-web-server");
 * var server = new WebServer({
 *   port: 3000, //port
 *   directory: "./public", //directory to publish
 *   serveindex: false, //disable serve-Index feature.
 *   acceptonlyget: true, //returns 405 to the request with method other than GET.
 *   useindexhtml: true, //returns /index.html on that directory when the directory was requested.
 *   rootfile: "/index.html", //the file that is used as the home page.
 *   errordocument: {
 *     _404: `./public/404.html`, //File path to use as a 404 error page.
 *     _405: `./public/405.html`, //File path to use as a 405 error page.
 *   }
 * });
 */

class WebServer {
  constructor(opts) {
    //super();
    this.opts = run(opts);
    function run(options) {
      if (options) {
        if (!options.errordocument) {
          options.errordocument = {};
        }
        var error_doc404 = options.errordocument._404 || `${__dirname}/../assets/def_pages/404.html`;
        var error_doc405 = options.errordocument._405 || `${__dirname}/../assets/def_pages/405.html`;
        try {
          var _404 = fs.readFileSync(error_doc404);
        } catch (error) {
          console.error(new Error(`Invailed 404 error file location "${error_doc404}". Default location will used.`));
          options.errordocument._404 = `${__dirname}/../assets/def_pages/404.html`;
        }
        try {
          var _405 = fs.readFileSync(error_doc405);
        } catch (error) {
          console.error(new Error(`Invailed 405 error file location "${error_doc405}". Default location will used.`));
          options.errordocument._405 = `${__dirname}/../assets/def_pages/405.html`;
        }
      }
      return options;
    }

  }

  /**
   * @returns {Promise<Object | null>} 
   */

  start() {
    var _this = this;
    return new Promise(async function (resolve, reject) {
      var opt = _this.opts;
      if (!opt) {
        var options = {
          directory: "./public",
          serveindex: false,
          //notfound: `<!DOCTYPE html>\n<html>\n<head>\n<title>404 Not Found</title>\n</head>\n<body>\n<center>\n<h1>404 Not Found</h1>\n</center>\n<hr>\n<center>Node.js lite-web-server</center>\n</body>\n</html>`,
          port: 3000,
          acceptonlyget: true,
          useindexhtml: true,
          rootfile: "/index.html",
          //req405error: `<!DOCTYPE html>\n<html>\n<head>\n<title>405 Method Not Allowed</title>\n</head>\n<body>\n<center>\n<h1>405 Method Not Allowed</h1>\n</center>\n<hr>\n<center>Node.js lite-web-server</center>\n</body>\n</html>`,
          errordocument: {
            _404: `${__dirname}/../assets/def_pages/404.html`,
            _405: `${__dirname}/../assets/def_pages/405.html`
          }
        }
      } else {
        var _dir = opt.dir || opt.directory || "./public";
        if (_dir == "/") {
          var __dir = ".";
        } else if (_dir.endsWith("/")) {
          var __dir = _dir.slice(0, -1);
        } else {
          var __dir = _dir;
        }
        if (__dir.startsWith("/")) {
          var dir = "." + __dir;
        } else {
          var dir = __dir;
        }
        if (opt.acceptonlyget === false) {
          var acceptonlyget = false;
        } else {
          var acceptonlyget = true;
        }
        if (opt.useindexhtml === false) {
          var useindexhtml = false;
        } else {
          var useindexhtml = true;
        }
        if (opt.serveindex === true) {
          var serveindex = true;
        } else {
          var serveindex = false;
        }
        if (!opt.errordocument) {
          opt.errordocument = {};
        }
        var options = {
          directory: dir || "./public",
          serveindex: serveindex,
          //notfound: opt.notfound || `<!DOCTYPE html>\n<html>\n<head>\n<title>404 Not Found</title>\n</head>\n<body>\n<center>\n<h1>404 Not Found</h1>\n</center>\n<hr>\n<center>Node.js lite-web-server</center>\n</body>\n</html>`,
          port: opt.port || 3000,
          acceptonlyget: acceptonlyget,
          useindexhtml: useindexhtml,
          rootfile: opt.rootfile || "/index.html",
          //req405error: opt.req405error || `<!DOCTYPE html>\n<html>\n<head>\n<title>405 Method Not Allowed</title>\n</head>\n<body>\n<center>\n<h1>405 Method Not Allowed</h1>\n</center>\n<hr>\n<center>Node.js lite-web-server</center>\n</body>\n</html>`,
          errordocument: {
            _404: opt.errordocument._404 || `${__dirname}/../assets/def_pages/404.html`,
            _405: opt.errordocument._405 || `${__dirname}/../assets/def_pages/405.html`
          }
        }
      }

      try {
        var dir = await fs.readdirSync(options.directory);
      } catch (error) {
        reject(new Error(`Please create directory "${options.directory}" first.`));
        return;
      }

      try {
        var httpserver = http.createServer(async function (req, res) {
          //var date = new Date();
          //var parsed_date = `${date.getUTCDate}`;
          //this.emit(Events.REQUEST_LOG, `[${parsed_date}] ${req.method} | ${req.url}`);
          if (!(req.method.toUpperCase() == "GET") && options.acceptonlyget == true) {
            try {
              var read_file = await fs.readFileSync(options.errordocument._405).toString();
              res.writeHead(405, { "Content-Type": "text/html" });
              return res.end(read_file);
            } catch (error) {
              res.writeHead(500, { "Content-Type": "text/html" });
              return res.end("<center><h1>Internal Server Error</h1></center>");
            }
          }
          var _url = decodeURIComponent(req.url);
          var url = safeurl(_url);
          //console.log(url);
          if (url == "/") {
            var filedir = `${options.directory}${options.rootfile}`;
          } else if (url.endsWith("/") && options.useindexhtml) {
            var filedir = `${options.directory}${url}index.html`;
          } else {
            var filedir = `${options.directory}${url}`;
          }

          var custom_mode = false;
          if (custom_mode == false) {
            try {
              var httpcontent = (await GetFileType(filedir.toString())) || "text/plain";
              var file = await fs.readFileSync(filedir);
              res.writeHead(200, { "Content-Type": httpcontent });
              res.end(file);
            } catch (error) {
              try {
                try {
                  var _loaddirurl = options.directory + "/";
                  if (url.endsWith("/")) {
                    var __loaddirurl = _loaddirurl
                    try {
                      //console.log(_loaddirurl+url.slice(1))
                      fs.readdirSync(_loaddirurl + url.slice(1))
                    } catch (error) {
                      throw new Error(error)
                    }
                  } else {
                    //console.log(req)
                    try {
                      //console.log(_loaddirurl+url.slice(1))
                      fs.readdirSync(_loaddirurl + url.slice(1))
                      if (url == `${url}/`) {

                        res.writeHead(302, { location: `${url}/`, });
                        res.end();
                        return;
                      }
                    } catch (error) {
                      throw new Error(error)
                    }

                    //var loaddirurl = _loaddirurl + "/"
                  }
                  var loaddirurl = `${__loaddirurl}`
                  //console.log(loaddirurl)
                  try {
                    if (options.serveindex === false) {
                      var read_file = await fs.readFileSync(options.errordocument._404).toString();
                      var file = read_file.replace(/<!--\${404URL}-->/g, `${url}`);
                      res.writeHead(404, { "Content-Type": "text/html" });
                      res.end(file);
                      return;
                    }
                    var serveindex = serveIndex(loaddirurl, { icons: true, view: "details" });
                    serveindex(req, res);
                  } catch (error) {
                    throw new Error(error)
                  }

                } catch (error) {
                  var read_file = await fs.readFileSync(options.errordocument._404).toString();
                  var file = read_file.replace(/<!--\${404URL}-->/g, `${url}`);
                  res.writeHead(404, { "Content-Type": "text/html" });
                  res.end(file);
                }
              } catch (error) {
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end("<center><h1>Internal Server Error</h1></center>");
              }
              //console.log(error)
            }
          } else {
            //this.emit(Events.REQUEST, (req, res, primary_html, primary_status_code));
          }

          //fs.Dir.readSync(options.directory+url)
          //console.log(options.directory)
        }).listen(options.port);
        _this.running = httpserver;
        _this.started = true;
        resolve(httpserver);
      } catch (error) {
        reject(new Error(error));
      }
    });
  }
}

module.exports = WebServer
