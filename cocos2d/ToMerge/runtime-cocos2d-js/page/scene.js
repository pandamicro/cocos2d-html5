var Vec2 = cc.Vec2;
var Helpers = Fire.Runtime.Helpers;

/**
 * @class SceneWrapper
 * @extends Fire.Runtime.SceneWrapper
 * @constructor
 * @param {RuntimeNode} node - The root node of current stage.
 */
var SceneWrapper = cc.FireClass({
    name: 'Runtime.SceneWrapper',
    extends: Fire.Runtime.SceneWrapper,

    properties: {

        childrenN: {
            get: function () {
                return this.targetN.children;
            },
            visible: false
        },

        position: {
            get: function () {
                return new Vec2(this.targetN.x, this.targetN.y);
            },
            set: function (value) {
                if ( value instanceof Vec2 ) {
                    this.targetN.setPosition(value.x, value.y);
                }
                else {
                    cc.error('The new position must be cc.Vec2');
                }
            }
        },

        worldPosition: {
            get: function () {
                return this.position;
            },
            set: function (value) {
                this.position = value;
            }
        },

        scale: {
            get: function () {
                return new Vec2(this.targetN.scaleX, this.targetN.scaleY);
            },
            set: function (value) {
                if ( value instanceof Vec2 ) {
                    this.targetN.scaleX = value.x;
                    this.targetN.scaleY = value.y;
                }
                else {
                    cc.error('The new scale must be cc.Vec2');
                }
            }
        },

        worldScale: {
            get: function () {
                return this.scale;
            },
            set: function (value) {
                this.scale = value;
            }
        },

        rotation: {
            get: function () {
                return this.targetN.rotation;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    this.targetN.rotation = value;
                }
                else {
                    cc.error('The new rotation must not be NaN');
                }
            }
        },

        worldRotation: {
            get: function () {
                return this.rotation;
            },
            set: function (value) {
                this.rotation = value;
            }
        },

        _position: {
            default: null
        },

        _scale: {
            default: null
        }
    },

    canAddChildN: function () {
        return true;
    },

    addChildN: function (child) {
        this.targetN.addChild( child );
    },

    removeChildN: function (child, cleanup) {
        this.targetN.removeChild( child, cleanup);
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

    transformPointToWorld: function (point) {
        var converted = this.targetN.convertToWorldSpaceAR(point);
        return new cc.Vec2(converted.x, converted.y);
    },

    transformPointToLocal: function (point) {
        var converted = this.targetN.convertToNodeSpaceAR(point);
        return new cc.Vec2(converted.x, converted.y);
    },

    attached: function () {
        // onEnter will be called when node enters the stage
        var originOnEnter= this.targetN.onEnter;
        this.targetN.onEnter = function () {
            originOnEnter.call(this);
            Helpers.onNodeAttachedToParent(this);
        };

        // onExit will be called when node leaves the stage
        var originOnExit = this.targetN.onExit;
        this.targetN.onExit = function () {
            originOnExit.call(this);
            Helpers.onNodeDetachedFromParent(this);
        };
    },

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

    retain: function () {
        this.targetN.retain();
    },

    release: function () {
        this.targetN.release();
    }
});

Runtime.SceneWrapper = module.exports = SceneWrapper;
