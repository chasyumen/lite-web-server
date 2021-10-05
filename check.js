var { WebServer, GetFileType } = require("./index.js");
var server = new WebServer({
  dir: "./",
  port: 3000
});

var filetype = GetFileType("/check.js")
