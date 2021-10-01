const http = require('http');
const path = require('path');
const fs = require("fs");
const filetype = require("./filetype");

/**
 * Start a WebServer.
 * @constructor
 * @param {Object} [options] - WebServer Options.
 * @param {string} [options.directory=./public/] - The directory to load the file. 
 * @param {string} [options.notfound] - Html code to respond on not found.
 * @param {Number} [options.port=3000] - Port to host the page.
 * @returns {boolean} 
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
          port: 3000
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
          port: opt.port || 3000
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
        resolve(httpserver);
      } catch (error) {
        reject(new Error(error));
      }
    });
  }
}

module.exports = {
  WebServer: WebServer,
  GetContentType: function (filename) {
    return filetype(filename);
  }
}