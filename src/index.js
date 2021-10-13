/*
    lite-web-server
    Copyright (c) 2021 chasyumen
    MIT Licensed
*/

'use strict'

const GetFileType = require("./GetFileType/index.js");
const WebServer = require("./WebServer.js");
const safeurl = require("./util/safe-url.js");

module.exports = {
  WebServer: WebServer,
  GetFileType: GetFileType,
  safeurl: safeurl,
  version: require('../package.json').version
}
