'use strict'

var { WebServer } = require("./index.js");
var server = new WebServer({
  dir: "./",
  port: 3000,
  acceptonlyget: true
});

server.start();