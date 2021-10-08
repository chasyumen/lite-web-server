/*
    lite-web-server
    Copyright (c) 2021 chasyumen
    MIT Licensed
*/

'use strict'

var { WebServer } = require("./index.js");
var server = new WebServer({
  dir: "./",
  port: 3000,
  acceptonlyget: true
});

server.start();