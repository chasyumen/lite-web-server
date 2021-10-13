/*
    lite-web-server
    Copyright (c) 2021 chasyumen
    MIT Licensed
*/

var index = require("./src/index.js"); //this file loads ./lib/index.js
var server = new index.WebServer({
  dir: "./",
  port: 3000,
  acceptonlyget: true,
  serveindex: true
});

var filename = "./check.html";
var filetype = index.GetFileType(filename);

