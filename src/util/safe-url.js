module.exports = function (url) {
    return url.replace(/\/\.\./g, "").replace(/\.\./g, "");
}