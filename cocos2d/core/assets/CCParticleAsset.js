/**
 * Class for particle asset handling.
 * @class ParticleAsset
 * @extends RawAsset
 * @constructor
 */
var ParticleAsset = cc.Class({
    name: 'cc.ParticleAsset',
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

                var wrapper = cc.getWrapper(node);
                wrapper.file = url;
                wrapper.name = Url.basenameNoExt(url);
                wrapper.preview = false;
                return callback(null, node);
            }
        }
    }
});

cc.ParticleAsset = ParticleAsset;
module.exports = ParticleAsset;
