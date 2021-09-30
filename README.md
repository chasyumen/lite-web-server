# lite-web-server

![TotalDownloads](https://img.shields.io/npm/dt/lite-web-server)

The npm package to create simple web server.

This will load files from `./public/` directory if it's not specified.

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

## API
### WebServer(options)

Constructor

#### options

##### port (optional)
Type: `Number`

Default: `3000`

```js
new WebServer({
  port: 3000
})
```

##### directory (optional)
Type: `String`

Default: `./public/`

The directory to load the file.

```js
new WebServer({
  dir: "./public_html/"
})
```

##### notfound (optional)
Type: `String` (html code)

Default: `404 Not Found`

```js
new WebServer({
  notfound: "<center><h1>File was not found on this server.</h1></center>"
})
```

### GetContentType(name)

Function

#### name

Type: `String`

Type a filename to get http header content-type.

```js
var { GetContentType } = require("lite-web-server")

var htmlname = "example.html"
var contenttype = GetContentType(htmlname)
console.log(contenttype) // "text/html"

var pngname = "image.png"
var contenttype = GetContentType(pngname)
console.log(contenttype) // "image/png"
```

## License
© chasyumen 2021. Released under the MIT license
