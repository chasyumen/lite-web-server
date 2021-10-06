const MimeTypes = require(__dirname+"/mime-types.js")
const path = require('path')

/**
 * Get content type of the file name for http header.
 * @function
 * @param {string} Filename - Filename to get header content type.
 * @returns {string} Filetype
 * @example const { GetFileType } = require("lite-web-server")
 * var filetype = GetFileType("main.js")
 */

function GetFileType(filename) {
  return MimeTypes.lookup(filename);
}


module.exports = GetFileType;
