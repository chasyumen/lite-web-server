# [lite-web-server](https://lite-web-server.js.org/)

[![License](https://img.shields.io/npm/l/lite-web-server)](https://github.com/chasyumen/lite-web-server/blob/main/LICENSE) [![Total downloads on NPM](https://img.shields.io/npm/dt/lite-web-server)](https://npmjs.com/package/lite-web-server) [![Monthly commit activity](https://img.shields.io/github/commit-activity/m/chasyumen/lite-web-server)](https://github.com/chasyumen/lite-web-server) [![Node.js CI](https://github.com/chasyumen/lite-web-server/actions/workflows/node.js.yml/badge.svg)](https://github.com/chasyumen/lite-web-server/actions/workflows/node.js.yml)

lite-web-server is a simple library for creating a web server.

Please support the developer by adding stars to the [Github Repository](https://github.com/chasyumen/lite-web-server).

[Documantation](https://lite-web-server.js.org/)

[Github](https://github.com/chasyumen/lite-web-server)

[NPM](https://npmjs.com/package/lite-web-server)

[Example Gist](https://gist.github.com/chasyumen/b96573602863354cedb2df963bbff425)


## Installation
```bash
npm i lite-web-server
```

## Example

Using `dir` option, you can specify the directory to load files from.
By default, the directory will be `./public/`.

```js
const { WebServer } = require("lite-web-server");
const server = new WebServer({
  dir: "./public_html/" // `./public/` by default
});

server.start();
```


## License
© chasyumen 2021. Released under the MIT license

