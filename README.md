# lite-web-server

[![TotalDownloads](https://img.shields.io/npm/dt/lite-web-server)](https://npmjs.com/package/lite-web-server) [![Build](https://img.shields.io/github/checks-status/chasyumen/lite-web-server/main)](https://github.com/chasyumen/lite-web-server) [![License](https://img.shields.io/npm/l/lite-web-server)](https://github.com/chasyumen/lite-web-server/blob/main/LICENSE)

The npm package to create simple web server.

This will load files from `./public/` directory if it's not specified.

[Documantation](https://lite-web-server.js.org/)

[Github Repository](https://github.com/chasyumen/lite-web-server)


## Install
```
npm i lite-web-server
```

## Example

This server will load files from `./public/` directory.

```js
var { WebServer } = require("lite-web-server")
var server = new WebServer()

server.start()
```

If you want to specify the directory to load a file, use the code below.

```js
var { WebServer } = require("lite-web-server")
var server = new WebServer({
  dir: "./public_html/"
})

server.start()
```



## License
© chasyumen 2021. Released under the MIT license