
var TiledMapAsset = cc.FireClass({
    name: 'Runtime.TiledMapAsset',
    extends: cc.RawAsset,

    statics: {
        createNodeByUrl: function (url, callback) {
            if (CC_EDITOR) {

                var Url = require('fire-url');

                Runtime.TiledMapWrapper.preloadTmx( url , function (err, textures) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    var node;
                    try {
                        node = new cc.TMXTiledMap(url);
                        node._file = url;
                    }
                    catch(e) {
                        return callback(e);
                    }

                    var wrapper = cc(node);
                    wrapper.name = Url.basenameNoExt(url);
                    wrapper._textures = textures;

                    return callback(null, node);
                }.bind(this) );

            }
        }
    }
});

Runtime.TiledMapAsset = TiledMapAsset;
module.exports = TiledMapAsset;
