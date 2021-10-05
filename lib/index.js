const filetype = require("./filetype.js");
const WebServer = require("./WebServer.js")

module.exports = {
  WebServer: WebServer,
  GetContentType: filetype
}