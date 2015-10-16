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

if (!cc.SpriteAsset) {
    var Sprite = (function () {
        var Sprite = cc.Class({
            name: 'cc.SpriteAsset',
            extends: cc.Asset,
            ctor: function () {
                var img = arguments[0];
                if (img) {
                    this.texture = new cc.TextureAsset(img);
                    this.width = img.width;
                    this.height = img.height;
                }
            },
            properties: {
                pivot: {
                    default: new cc.Vec2(0.5, 0.5),
                    tooltip: 'The pivot is normalized, like a percentage.\n' +
                             '(0,0) means the bottom-left corner and (1,1) means the top-right corner.\n' +
                             'But you can use values higher than (1,1) and lower than (0,0) too.'
                },
                trimX: {
                    default: 0,
                    type: 'Integer'
                },
                trimY: {
                    default: 0,
                    type: 'Integer'
                },
                width: {
                    default: 0,
                    type: 'Integer'
                },
                height: {
                    default: 0,
                    type: 'Integer'
                },
                texture: {
                    default: null,
                    type: cc.TextureAsset,
                    visible: false
                },
                rotated: {
                    default: false,
                    visible: false
                },
                x: {
                    default: 0,
                    type: 'Integer',
                    visible: false
                },
                y: {
                    default: 0,
                    type: 'Integer',
                    visible: false
                },
                rawWidth: {
                    default: 0,
                    type: 'Integer',
                    visible: false
                },
                rawHeight: {
                    default: 0,
                    type: 'Integer',
                    visible: false
                },
                pixelLevelHitTest: {
                    default: false,
                    tooltip: 'Use pixel-level hit testing.'
                },
                alphaThreshold: {
                    default: 0.1,
                    tooltip: 'The highest alpha channel value that is considered opaque for hit test.',
                    watch: {
                        'pixelLevelHitTest': function (obj, propEL) {
                            propEL.disabled = !obj.pixelLevelHitTest;
                        }
                    }
                },
                borderTop: {
                    default: 0,
                    type: 'Integer'
                },
                borderBottom: {
                    default: 0,
                    type: 'Integer'
                },
                borderLeft: {
                    default: 0,
                    type: 'Integer'
                },
                borderRight: {
                    default: 0,
                    type: 'Integer'
                }
            }
        });

        return Sprite;
    })();

    cc.SpriteAsset = Sprite;

    cc.js.get(Sprite.prototype, 'rotatedWidth', function () {
        return this.rotated ? this.height : this.width;
    });

    cc.js.get(Sprite.prototype, 'rotatedHeight', function () {
        return this.rotated ? this.width : this.height;
    });
}

if (!cc.TextureAsset) {
    var Texture = (function () {
        var WrapMode = cc.Enum({
            Repeat: -1,
            Clamp: -1
        });
        var FilterMode = cc.Enum({
            Point: -1,
            Bilinear: -1,
            Trilinear: -1
        });
        var Texture = cc.Class({
            name: 'cc.TextureAsset',
            extends: cc.Asset,
            ctor: function () {
                var img = arguments[0];
                if (img) {
                    this.image = img;
                    this.width = img.width;
                    this.height = img.height;
                }
            },
            properties: {
                image: {
                    default: null,
                    rawType: 'image',
                    visible: false
                },
                width: {
                    default: 0,
                    type: 'Integer',
                    readonly: true
                },
                height: {
                    default: 0,
                    type: 'Integer',
                    readonly: true
                },
                wrapMode: {
                    default: WrapMode.Clamp,
                    type: WrapMode,
                    readonly: true
                },
                filterMode: {
                    default: FilterMode.Bilinear,
                    type: FilterMode,
                    readonly: true
                }
            },
        });

        Texture.WrapMode = WrapMode;
        Texture.FilterMode = FilterMode;

        return Texture;
    })();
    cc.TextureAsset = Texture;
}

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
