# lite-web-server

[![TotalDownloads](https://img.shields.io/npm/dt/lite-web-server)](https://npmjs.com/package/lite-web-server) [![GitHub commit activity m](https://img.shields.io/github/commit-activity/m/chasyumen/lite-web-server)](https://github.com/chasyumen/lite-web-server) [![Node.js CI](https://github.com/chasyumen/lite-web-server/actions/workflows/node.js.yml/badge.svg)](https://github.com/chasyumen/lite-web-server/actions/workflows/node.js.yml) [![License](https://img.shields.io/npm/l/lite-web-server)](https://github.com/chasyumen/lite-web-server/blob/main/LICENSE)

The npm package to create simple web server.

This will load files from `./public/` directory if it's not specified.

Please support developer by adding star to the [Github Repository](https://github.com/chasyumen/lite-web-server).

[Documantation](https://lite-web-server.js.org/)

[Github Repository](https://github.com/chasyumen/lite-web-server)

[NPM](https://npmjs.com/package/lite-web-server)

[Example Usage](https://gist.github.com/chasyumen/b96573602863354cedb2df963bbff425)


## Install
```
npm i lite-web-server
```

## Example

This server will load files from `./public/` directory.

```js
var { WebServer } = require("lite-web-server");
var server = new WebServer();

server.start();
```

If you want to specify the directory to load a file, use the code below.

```js
var { WebServer } = require("lite-web-server");
var server = new WebServer({
  dir: "./public_html/"
});

server.start();
```


## License
© chasyumen 2021. Released under the MIT license

