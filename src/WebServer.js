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
const safeurl = require("./util/safe-url.js");

const Events = {
  DEBUG: "debug",
  REQUEST: "request",
  REQUEST_LOG: "requestlog"
}; // extends EventEmitter

/**
 * WebServer's options.
 * @typedef WebServer~WebServerOptions
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
 * @param {WebServer~WebServerOptions} [options] - WebServer Options.
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

class WebServer extends EventEmitter {
  constructor(opts) {
    super();
    this.opts = run(opts);
    function run(options) {
      if (options) {
        if (!options.errordocument) {
          options.errordocument = {};
        }
        var error_doc404 = options.errordocument._404 || `${__dirname}/../assets/def_pages/404.html`;
        var error_doc405 = options.errordocument._405 || `${__dirname}/../assets/def_pages/405.html`;
        var logmode = options.logmode || 1;
        try {
          var _404 = fs.readFileSync(error_doc404);
        } catch (error) {
          console.error(new Error(`Invalid 404 error file location "${error_doc404}". Default location will used.`));
          options.errordocument._404 = `${__dirname}/../assets/def_pages/404.html`;
        }
        try {
          var _405 = fs.readFileSync(error_doc405);
        } catch (error) {
          console.error(new Error(`Invalid 405 error file location "${error_doc405}". Default location will used.`));
          options.errordocument._405 = `${__dirname}/../assets/def_pages/405.html`;
        }
        if ((!logmode == 1||logmode == 2||logmode == 3)) {
          console.error(new Error(`Invalid log mode specified. It must be 1, 2 or 3.`));
          options.logmode = 1;
        }
      }
      return options;
    }
  }

  /**
   * @returns {Promise<Object | null>} 
   */

  start() {
    this.emit(Events.DEBUG, `Starting the server...`, {type: "message", message: "Starting the server..."});
    var _this = this;
    return new Promise(async function (resolve, reject) {
      var opt = _this.opts;
      if (!opt) {
        var options = {
          directory: "./public",
          serveindex: false,
          port: 3000,
          acceptonlyget: true,
          useindexhtml: true,
          rootfile: "/index.html",
          logmode: 1,
          logtimezone: 0,
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
        if (typeof opt.logtimezone == "number") {
          var logtimezone = opt.logtimezone*3600*1000;
        } else {
          var logtimezone = 0;
        }
        if (!opt.errordocument) {
          opt.errordocument = {};
        }
        var options = {
          directory: dir || "./public",
          serveindex: serveindex,
          port: opt.port || 3000,
          acceptonlyget: acceptonlyget,
          useindexhtml: useindexhtml,
          rootfile: opt.rootfile || "/index.html",
          logmode: opt.logmode || 1,
          logtimezone: logtimezone,
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
          var timestamp = Date.now()+options.logtimezone;
          var date = new Date(timestamp);
          var year = date.getUTCFullYear();
          var _month = (date.getUTCMonth() + 1).toString();
          if (_month.length == 1) {
            var month = "0"+_month.toString();
          } else {
            var month = _month;
          }
          var _day = date.getUTCDate().toString();
          if (_day.length == 1) {
            var day = "0"+_day.toString();
          } else {
            var day = _day;
          }
          var _hour = date.getUTCHours().toString();
          if (_hour.length == 1) {
            var hour = "0"+_hour.toString();
          } else {
            var hour = _hour;
          }
          var _minute = date.getUTCMinutes().toString();
          if (_minute.length == 1) {
            var minute = "0"+_minute.toString();
          } else {
            var minute = _minute;
          }
          var _second = date.getUTCSeconds().toString();
          if (_second.length == 1) {
            var second = "0"+_second.toString();
          } else {
            var second = _second;
          }
          var _milli = date.getUTCMilliseconds().toString();
          if (_milli.length == 2) {
            var milli = "0"+_milli.toString();
          } else if (_milli.length == 1) {
            var milli = "00"+_milli.toString();
          } else {
            var milli = _milli;
          }
          if (options.logmode == 1) {
            var parsed_date = `${month}/${day}/${year} ${hour}:${minute}:${second}.${milli}`;
          } else if (options.logmode == 2) {
            var parsed_date = `${year}/${month}/${day} ${hour}:${minute}:${second}.${milli}`;
          } else if (options.logmode == 3) {
            var parsed_date = `${hour}:${minute}:${second}.${milli}`;
          }
          var returns = `[${parsed_date} REQUEST_LOG] ${req.method} | ${req.url}`;
          var detail = {
            method: req.method,
            url: req.url,
            requestedAt: date,
            requestedAtTimestamp: Number(timestamp.toString().slice(0, -3)),
            raw: returns
          }
          /**
            * Emits when the client sent a request to the server.
            * But you cannot respond to the request from this event.
            * 
            * @fires WebServer#requestlog
            */

          _this.emit(Events.REQUEST_LOG, detail);

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
          var _url = decodeURIComponent(req.url).slice(1);
          var url = safeurl("/"+_url);
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
              res.setHeader("x-powered-by", "lite-web-server");
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
                      if (url+"/" == `${url}/`) {

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
                    serveindex(req, res, url);
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

/**
 * Debug messages.
 * 
 * @event WebServer#debug
 * @type {object}
 * @property {string} - Debug log message.
 * @example 
 * server.on("debug", msg => console.log(msg))
 */

/**
 * WebServer request event for logging.
 * 
 * @event WebServer#requestlog
 * @type {object}
 * @property {WebServer~WebServerRequestLog}
 * @example 
 * server.on("requestlog", requestlog => console.log(requestlog.raw))
 */

/**
 * @typedef WebServer~WebServerRequestLog
 * @type {object}
 * @property {object} options
 * @property {Number} options.method - The method that used on request.
 * @property {string} options.url - Requested URL. 
 * @property {object} options.requestedAt - Requested time object.
 * @property {Number} options.requestedAtTimestamp - Requested time in timestamp.
 * @property {string} options.raw - The string can be used for the output directly.
 */
