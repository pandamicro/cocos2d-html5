// platform definition

var TestEditorExtends = typeof Editor === 'object' && Editor.serialize;

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
            id: 'test-canvas',
            debugMode: cc.DebugMode.INFO
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

_resetGame(64, 64);

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
