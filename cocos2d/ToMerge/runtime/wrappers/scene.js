/**
 * @module Fire.Runtime
 */

var NodeWrapper = require('./node');
var NYI = require('./utils').NYI;

/**
 * You should override:
 * - childrenN
 * - createNode
 * - position
 * - scale
 *
 * You may want to override:
 * - onBeforeSerialize (so that the scene's properties can be serialized in wrapper)
 * - preloadAssets (so that scene can load synchronously)
 *
 * @class SceneWrapper
 * @extends NodeWrapper
 * @constructor
 * @param {RuntimeNode} node - The root node of current stage.
 */
var SceneWrapper = cc.FireClass({
    name: 'Fire.Runtime.SceneWrapper',
    extends: NodeWrapper,
    constructor: function () {
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
        }
        /**
         * The local position in its parent's coordinate system.
         * This is used to simulate the panning of preview camera in edit mode.
         * @property position
         * @type {cc.Vec2}
         */
        /**
         * The local scale factor relative to the parent.
         * This is used to simulate the zoom in and out of preview camera in edit mode.
         * @property scale
         * @type {cc.Vec2}
         */
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
        callback();
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
    }
});

module.exports = SceneWrapper;
