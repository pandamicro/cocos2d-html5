﻿// platform definition

cc.isUnitTest = true;

// shortcuts

var CCObject = cc.Object;
var Asset = cc.Asset;
var Vec2 = cc.Vec2;
var Rect = cc.Rect;
var Color = cc.Color;
var Texture = cc.Texture;
//var Sprite = cc.Sprite;
//var Atlas = cc.Atlas;
//var FontInfo = cc.FontInfo;

var Ticker = cc._Ticker;
var Time = cc.Time;
//var Entity = cc.Entity;
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
            getPixel: function (x, y) {
                if (!canvasCtxToGetPixel) {
                    var canvas = document.createElement('canvas');
                    canvas.width = 1;
                    canvas.height = 1;
                    canvasCtxToGetPixel = canvas.getContext('2d');
                }
                if (this.wrapMode === Texture.WrapMode.Clamp) {
                    x = Math.clamp(x, 0, this.image.width);
                    y = Math.clamp(y, 0, this.image.height);
                }
                else if (this.wrapMode === Texture.WrapMode.Repeat) {
                    x = x % this.image.width;
                    if (x < 0) {
                        x += this.image.width;
                    }
                    y = y % this.image.width;
                    if (y < 0) {
                        y += this.image.width;
                    }
                }
                canvasCtxToGetPixel.clearRect(0, 0, 1, 1);
                canvasCtxToGetPixel.drawImage(this.image, x, y, 1, 1, 0, 0, 1, 1);

                var imgBytes = null;
                try {
                    imgBytes = canvasCtxToGetPixel.getImageData(0, 0, 1, 1).data;
                }
                catch (e) {
                    cc.error("An error has occurred. This is most likely due to security restrictions on reading canvas pixel data with local or cross-domain images.");
                    return cc.Color.TRANSPARENT;
                }
                var result = new cc.Color();
                result.r = imgBytes[0] / 255;
                result.g = imgBytes[1] / 255;
                result.b = imgBytes[2] / 255;
                result.a = imgBytes[3] / 255;
                return result;
            }
        });

        Texture.WrapMode = WrapMode;
        Texture.FilterMode = FilterMode;

        return Texture;
    })();
    cc.TextureAsset = Texture;

    var canvasCtxToGetPixel = null;
}

cc.RawTexture = cc.Class({
    name: 'cc.RawTexture',
    extends: cc.RawAsset
});

TestNode = function () {
    this.children = [];
    this.name = arguments[0] || '';
    this.parent = null;
    this.scale = cc.Vec2.one;
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
                if (value) {
                    value.children.push(this.targetN);
                }
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
                return this.targetN.scale;
            },
            set: function (value) {
                this.targetN.scale = value;
            },
        },
        worldScale: {
            get: function () {
                return cc.Vec2.one;
            }
        },
        _serializeData: {
            default: {}
        }
    },
    onBeforeSerialize: function () {
        this._serializeData.name = this.name;
        this._serializeData.scale = this.scale;
    },
    createNode: function (node) {
        node = node || new TestNode();
        node.name = this._serializeData.name;
        node.scale = this._serializeData.scale;
        return node;
    },
    attached: function () {
    },
});
cc.Runtime.registerNodeType(TestNode, TestWrapper);

var TestScript = cc.Class({
    name: 'TestScript',
    extends: cc.Behavior,
    properties: {
        target: {
            default: null,
            type: TestNode
        },
        target2: {
            default: null,
            type: TestNode
        },
    }
});

var assetDir = '../test/qunit/assets';

var canvas;
function _resetGame (w, h) {
    if (!cc.game._prepared && !cc.game._prepareCalled) {
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'test-canvas';
            document.body.appendChild(canvas);
        }
        cc.game.run({
            width: w,
            height: h,
            id: 'test-canvas'
        });
    }
    else {
        var view = cc.view;

        cc._canvas.width = w * view.getDevicePixelRatio();
        cc._canvas.height = h * view.getDevicePixelRatio();

        cc._canvas.style.width = w;
        cc._canvas.style.height = h;

        // reset container style
        var style = cc.container.style;
        style.paddingTop = "0px";
        style.paddingRight = "0px";
        style.paddingBottom = "0px";
        style.paddingLeft = "0px";
        style.borderTop = "0px";
        style.borderRight = "0px";
        style.borderBottom = "0px";
        style.borderLeft = "0px";
        style.marginTop = "0px";
        style.marginRight = "0px";
        style.marginBottom = "0px";
        style.marginLeft = "0px";

        cc.container.style.width = w;
        cc.container.style.height = h;

        var size = view.getDesignResolutionSize();
        view.setDesignResolutionSize(size.width, size.height, view.getResolutionPolicy());

        cc.eventManager.dispatchCustomEvent('canvas-resize');
    }
    //Engine._launchScene(new cc._Scene());

    cc.director.pause();
}

var SetupEngine = {
    setup: function () {
        _resetGame(256, 512);
        //// check error
        //Engine._renderContext.checkMatchCurrentScene(true);
    },
    teardown: function () {
        //Engine._launchScene(new cc._Scene());
        cc.game.pause();
        //// check error
        //Engine._renderContext.checkMatchCurrentScene(true);
    }
};

// force stop to ensure start will only called once
function asyncEnd () {
    cc.game.pause();
    //Engine.tick = function () {};
    //Engine.tickInEditMode = function () {};
    start();
}

function fastArrayEqual (actual, expected, message) {
    var hasError = false;
    if (hasError) {
        if (actual.length !== expected.length) {
            strictEqual(actual.length, expected.length, message + ' (array length should equal)');
        }
        for (var i = 0; i < expected.length; i++) {
            ok(actual[i] === expected[i], message + ' (element ' + i + ' should equal)');
        }
    }
    else {
        deepEqual(actual, expected, message);
    }
}

// output test states

//QUnit.testStart = function(test) {
//    console.log('#' + (test.module || '') + ": " + test.name + ": started.");
//};
//
//QUnit.testDone = function(test) {
//    console.log('#' + (test.module || '') + ": " + test.name + ": done.");
//    console.log('----------------------------------------');
//};
