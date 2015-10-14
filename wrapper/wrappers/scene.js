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
    name: 'cc.Runtime.SceneWrapper',
    extends: NodeWrapper,
    ctor: function () {
        this._dataToDeserialize = null;
    },

    properties: {
        parentN: {
            get: function () {
                return null;
            },
            set: function () {
                if (CC_DEV) {
                    cc.error("Disallow to set scene's parent.");
                }
            }
        },
        scenePosition: {
            get: function () {
                return new cc.Vec2(0, 0);
            },
            set: function () {
                cc.error("Disallow to set scene's scenePosition.");
            },
            visible: false
        },

        _position: {
            default: null
        },

        _scale: {
            default: null
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
        var urls = assetObjects.map( function (asset) {
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

    onBeforeSerialize: function () {
        this._scale = [this.scaleX, this.scaleY];
        this._position = [this.position.x, this.position.y];
    },

    createNode: function (node) {
        node = node || new cc.Scene();

        node.setAnchorPoint(0.0, 0.0);

        node.x = this._position ? this._position[0] : 0;
        node.y = this._position ? this._position[1] : 0;
        node.scaleX = this._scale ? this._scale[0] : 1;
        node.scaleY = this._scale ? this._scale[1] : 1;

        return node;
    },

    getSiblingIndex: function () {
        return 0;
    },

    setSiblingIndex: function (index) {
        if (CC_DEV) {
            if (index !== 0) {
                cc.error("Disallow to change scene's sibling index.");
            }
        }
    },

    _deepQueryChildren: function (cb) {

        function traversal (node, cb) {
            var children = node.children;

            for (var i = 0; i<children.length; i++) {
                var child = children[i];

                if (!cb( child )) break;

                traversal(child, cb);
            }
        }

        traversal(this, cb);
    },
});

module.exports = SceneWrapper;
