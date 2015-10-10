if (CC_EDITOR) {
    var Url = require('fire-url');
    Fire.BitmapFont.createNodeByUrl = function (url, callback) {
        var node;

        try {
            node = new cc.LabelBMFont();
        }
        catch (err) {
            return callback(err);
        }

        var wrapper = cc(node);
        wrapper.name = Url.basenameNoExt(url);
        wrapper.text = 'Text';
        wrapper.bitmapFont = url;

        return callback(null, node);
    };
}
