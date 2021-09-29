var { WebServer } = require("./index.js")
var server = new WebServer({
  dir: "./lib",
  port: 3000
})

server.start()