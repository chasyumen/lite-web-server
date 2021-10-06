/**
 * Get content type of the file name for http header.
 * @function
 * @param {string} Filename - Filename to get header content type.
 * @returns {string} Filetype
 * @example <caption></caption>
 * const { GetFileType } = require("lite-web-server")
 * var filetype = GetFileType("main.js")
 */

function GetFileType(filename) {
  var filetype = "text/plain";
  if (filename.endsWith(".html")||filename.endsWith(".htm")) {
    filetype = "text/html";
  } else if (filename.endsWith(".css")) {
    filetype = "text/css";
  } else if (filename.endsWith(".csv")) {
    filetype = "text/csv";
  } else if (filename.endsWith(".js")) {
    filetype = "text/javascript";
  } else if (filename.endsWith(".xml")) {
    filetype = "text/xml";
  } else if (filename.endsWith(".css")) {
    filetype = "text/plain";
  } else if (filename.endsWith(".json")) {
    filetype = "application/json";
  } else if (filename.endsWith(".png")) {
    filetype = "image/png";
  } else if (filename.endsWith(".jpg")||filename.endsWith(".jpeg")||filename.endsWith(".jfif")) {
    filetype = "image/jpeg";
  } else if (filename.endsWith(".gif")) {
    filetype = "image/gif";
  } else if (filename.endsWith(".svg")) {
    filetype = "image/svg+xml";
  } else if (filename.endsWith(".ico")) {
    filetype = "image/x-icon";
  } else if (filename.endsWith(".webp")) {
    filetype = "image/webp";
  } else if (filename.endsWith(".tif")) {
    filetype = "image/tiff";
  } else if (filename.endsWith(".djvu")) {
    filetype = "image/vnd.djvu";
  } else if (filename.endsWith(".mp3")) {
    filetype = "audio/mpeg";
  } else if (filename.endsWith(".wav")) {
    filetype = "audio/x-wav";
  } else if (filename.endsWith(".flac")) {
    filetype = "audio/flac";
  } else if (filename.endsWith(".ogg")) {
    filetype = "application/ogg";
  } else if (filename.endsWith(".mp4")) {
    filetype = "video/mp4";
  } else if (filename.endsWith(".webm")) {
    filetype = "video/webm";
  } else {
    filetype = "text/plain";
  }
  return filetype;
}


module.exports = GetFileType;