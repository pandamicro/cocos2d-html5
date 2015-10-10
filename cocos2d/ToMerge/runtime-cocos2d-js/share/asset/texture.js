if (CC_EDITOR) {
    var Url = require('fire-url');
    Fire.Texture.createNodeByUrl = function (url, callback) {
        var sprite;

        try {
            sprite = new cc.Sprite(url);
        }
        catch(err) {
            return callback(err);
        }

        var wrapper = cc(sprite);
        wrapper.name = Url.basenameNoExt(url);

        return callback(null, sprite);
    };
}
