const http = require('http');
const path = require('path');
const fs = require("fs");

/**
 * WebServer's options.
 * @typedef WebServerOptions
 * @type {object}
 * @property {object} [options]
 * @property {string} [options.directory=./public/] - The directory to load the file. 
 * @property {boolean} [options.acceptonlyget=true] - Only accepts get request.
 * @property {string} [options.notfound=default html code] - Html code to respond on not found.
 * @property {string} [options.req405error=default html code] - Html code to respond on post, put, delete and etc.
 * @property {Number} [options.port=3000] - Port to host the page.
 */

/**
 * Create a WebServer.
 * @constructor
 * @param {WebServerOptions} [options] - WebServer Options.
 * @returns {WebServer} 
 */

class WebServer {
  constructor(opts) {
    this.opts = opts;
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
          notfound: `<!DOCTYPE html>\n<html>\n<head>\n<title>404 Not Found</title>\n</head>\n<body>\n<center>\n<h1>404 Not Found</h1>\n</center>\n<hr>\n<center>Node.js lite-web-server</center>\n</body>\n</html>`,
          port: 3000,
          acceptonlyget: true,
          req405error: `<!DOCTYPE html>\n<html>\n<head>\n<title>405 Method Not Allowed</title>\n</head>\n<body>\n<center>\n<h1>405 Method Not Allowed</h1>\n</center>\n<hr>\n<center>Node.js lite-web-server</center>\n</body>\n</html>`
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
        var options = {
          directory: dir || "./public",
          notfound: opt.notfound || `<!DOCTYPE html>\n<html>\n<head>\n<title>404 Not Found</title>\n</head>\n<body>\n<center>\n<h1>404 Not Found</h1>\n</center>\n<hr>\n<center>Node.js lite-web-server</center>\n</body>\n</html>`,
          port: opt.port || 3000,
          acceptonlyget: opt.acceptonlyget || true,
          req405error: opt.req405error || `<!DOCTYPE html>\n<html>\n<head>\n<title>405 Method Not Allowed</title>\n</head>\n<body>\n<center>\n<h1>405 Method Not Allowed</h1>\n</center>\n<hr>\n<center>Node.js lite-web-server</center>\n</body>\n</html>`
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
          if (!(req.method.toUpperCase() == "GET")&&options.acceptonlyget == true) {
            res.writeHead(405, { "Content-Type": "text/html" });
            return res.end(options.req405error);
          }
          var url = req.url
          //console.log(url)
          if (url == "/") {
            var filedir = `${options.directory}/index.html`
          } else {
            var filedir = `${options.directory}${url}`
          }
          try {
            var httpcontent = await filetype(filedir.toString())
            var file = await fs.readFileSync(filedir)
            res.writeHead(200, { "Content-Type": httpcontent })
            res.end(file)
          } catch (error) {
            res.writeHead(404, { "Content-Type": "text/html" })
            res.end(options.notfound)
            //console.log(error)
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