// platform definition

cc.isUnitTest = true;

// shortcuts

var FObject = cc.Object;
//var Asset = cc.Asset;
var Vec2 = cc.Vec2;
var Rect = cc.Rect;
var Color = cc.Color;
//var Texture = cc.TextureAsset;
//var Sprite = cc.SpriteAsset;
//var Atlas = cc.Atlas;
//var FontInfo = cc.FontInfo;

var Ticker = cc._Ticker;
var Time = cc.Time;
//var Entity = cc.Entity;
//var Engine = cc.engine;
//var Camera = cc.Camera;
//var Component = cc.Component;
var LoadManager = cc._LoadManager;
var AssetLibrary = cc.AssetLibrary;
//var SpriteRenderer = cc.SpriteRenderer;
//var Screen = cc.Screen;

var FO = cc.Object;
var V2 = cc.Vec2;
var v2 = cc.v2;
var color = cc.fireColor;

cc.RawTexture = cc.Class({
    name: 'cc.RawTexture',
    extends: cc.RawAsset
});

if (cc.isBrowser) {
    var EngineWrapper = cc.Class({
        extends: cc.Runtime.EngineWrapper,
        initRuntime: function () {},
        ctor: function () {
            this._scene = null;
        },
        initRuntime: function () {},
        playRuntime: function () {},
        pauseRuntime: function () {},
        resumeRuntime: function () {},
        stopRuntime: function () {},
        tick: function () {},
        tickInEditMode: function () {},
        _setCurrentSceneN: function (scene) {
            this._scene = scene;
        },
        getCurrentSceneN: function () {
            return this._scene;
        }
    });

    TestNode = function () {
        this.children = [];
        this.name = arguments[0];
        this.parent = null;
    };
    TestWrapper = cc.Class({
        name: 'TestWrapper',
        extends: cc.Runtime.NodeWrapper,
        properties: {
            name: {
                get: function () {
                    return this.targetN.name;
                },
                set: function (value) {
                    this.targetN.name = value;
                }
            },
            parentN: {
                get: function () {
                    return this.targetN.parent;
                },
                set: function (value) {
                    if (this.targetN.parent) {
                        cc.js.array.remove(this.targetN.parent.children, this.targetN);
                    }
                    this.targetN.parent = value;
                    value.children.push(this.targetN);
                }
            },
            childrenN: {
                get: function () {
                    return this.targetN.children;
                }
            },
            position: {
                get: function () {
                    return cc.v2(123, 456);
                }
            },
            worldPosition: {
                get: function () {
                    return cc.Vec2.zero;
                }
            },
            rotation: {
                get: function () {
                    return 0;
                }
            },
            worldRotation: {
                get: function () {
                    return 0;
                }
            },
            scale: {
                get: function () {
                    return cc.Vec2.one;
                }
            },
            worldScale: {
                get: function () {
                    return cc.Vec2.one;
                }
            }
        },
        createNode: function () {
            return new TestNode();
        }
    });
    cc.Runtime.registerNodeType(TestNode, TestWrapper);
}
