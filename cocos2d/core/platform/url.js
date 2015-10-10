/**
 * @class url
 * @static
 */
cc.url = {

    /**
     * The base url of raw assets.
     * @property _rawAssets
     * @readOnly
     */
    _rawAssets: '',

    /**
     * Returns the url of raw assets.
     * @method raw
     * @param {string} url
     * @return {string}
     * @example
var url = cc.url.raw("textures/myTexture.png");
console.log(url);   // "resources/raw/textures/myTexture.png"
     */
    raw: function (url) {
        if (url[0] === '.' && url[1] === '/') {
            url = url.slice(2);
        }
        else if (url[0] === '/') {
            url = url.slice(1);
        }
        return this._rawAssets + url;
    }
};

module.exports = cc.url;
