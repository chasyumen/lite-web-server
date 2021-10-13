/**
 * removes `/..` from url.
 * @function
 * @param {URL} [string] - 
 * @returns {string} - URL
 * @example <caption>Simple example</caption>
 * const { SafeUrl } = require("lite-web-server");
 */

function SafeUrl(url) {
    if (!typeof url == "string") {
        throw new Error("Invalid parameter specified.");
    }
    var _result = url.replace(/\.\./g, "").replace(/\/\//g, "");
    if (_result == "") {
        var __result = "/";
    } else if ((!_result.endsWith("/")&&url.endsWith("/"))) {
        var __result = _result+"/";
    } else {
        var __result = _result;
    }

    if (!__result.startsWith("/")&&url.startsWith("/")) {
      var result = `/${__result}`;
    } else {
      var result = __result;
    }
    return result;
}

module.exports = SafeUrl;