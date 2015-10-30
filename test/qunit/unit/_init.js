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

var TestScript = cc.Class({
    name: 'TestScript',
    extends: cc.Component,
    properties: {
        target: {
            default: null,
            type: cc.ENode
        },
        target2: {
            default: null,
            type: cc.ENode
        },
    }
});

cc.engine = {
    attachedObjsForEditor: {},
    getInstanceById: function (uuid) {
        return this.attachedObjsForEditor[uuid] || null;
    },
};

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
    cc.director.runScene(new cc.EScene());
    //cc.director.pause();
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
        // check error
        cc._Test.SceneGraphUtils.checkMatchCurrentScene();
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
