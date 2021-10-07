var index = require("./src/index.js"); //this file loads ./lib/index.js
var server = new index.WebServer({
  dir: "./",
  port: 3000,
  acceptonlyget: true,
  notfound: "This page shows that the url requested was not found on this server!",
  req405error: "This page shows that you sent a request with incorrect method!"
});

var filename = "./check.html";
var filetype = index.GetFileType(filename);

