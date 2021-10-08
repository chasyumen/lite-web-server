/*
    lite-web-server
    Copyright (c) 2021 chasyumen
    MIT Licensed
*/

'use strict'

const GetFileType = require("./GetFileType/index.js");
const WebServer = require("./WebServer.js");

module.exports = {
  WebServer: WebServer,
  GetFileType: GetFileType,
  version: require('../package.json').version
}
