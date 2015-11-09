/**
 * @module cc.Runtime
 */

var Vec2 = cc.Vec2;
var NodeWrapper = require('./node');

/**
 * @class SceneWrapper
 * @extends NodeWrapper
 * @constructor
 * @param {RuntimeNode} node - The root node of current stage.
 */
var SceneWrapper = cc.Class({
    name: 'cc.SceneWrapper',
    extends: NodeWrapper,

    properties: {
        scenePosition: {
            get: function () {
                return new cc.Vec2(0, 0);
            },
            set: function () {
                cc.error("Disallow to set scene's scenePosition.");
            },
            visible: false
        }
    },

    /**
     * Preload resources before scene loading.
     * @method preloadAssets
     * @param {Assets[]} assetObjects
     * @param {string[]} rawAssetUrls
     * @param {function} callback
     * @param {string} callback.error
     */
    preloadAssets: function (assetObjects, rawAssetUrls, callback) {
        var urls = assetObjects.map(function (asset) {
            return asset.url;
        });

        urls = urls.concat(rawAssetUrls);

        // currently cocos jsb 3.3 not support preload too much assets
        // so we divide assets to 30 a group
        var index = 0;
        var count = 30;
        var total = urls.length;

        function preload () {
            if (index + count > total) {
                count = total - index;
            }

            var assets = urls.slice(index, count);

            index += count;

            if (index < urls.length) {
                cc.loader.load(assets, preload);
            }
            else {
                callback();
            }
        }

        preload();
    },


    _deepQueryChildren: function (cb) {

        function traversal (node, cb) {
            var children = node.children;

            for (var i = 0; i < children.length; i++) {
                var child = children[i];

                if (!cb(child)) break;

                traversal(child, cb);
            }
        }

        traversal(this, cb);
    },

    // 临时加回来，之后要干掉这些wrapper
    retain: function () {
        this.targetN.retain();
    },
    release: function () {
        this.targetN.release();
    }
});

module.exports = SceneWrapper;
