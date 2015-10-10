
var ParticleAsset = cc.FireClass({
    name: 'Runtime.ParticleAsset',
    extends: cc.RawAsset,

    statics: {
        createNodeByUrl: function (url, callback) {
            if (CC_EDITOR) {
                var Url = require('fire-url');
                var node;
                try {
                    node = new cc.ParticleSystem();
                }
                catch(e) {
                    return callback(e);
                }

                var wrapper = cc(node);
                wrapper.file = url;
                wrapper.name = Url.basenameNoExt(url);
                wrapper.preview = false;
                return callback(null, node);
            }
        }
    }
});

Runtime.ParticleAsset = ParticleAsset;
module.exports = ParticleAsset;
