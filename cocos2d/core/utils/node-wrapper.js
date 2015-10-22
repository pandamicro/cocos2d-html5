/****************************************************************************
 Copyright (c) 2015 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var JS = cc.js;
var SceneGraphMaintainer = require('./utils/scene-graph-maintainer');

// A base internal wrapper for CCNode and CCScene, it will:
// - the same api with origin cocos2d rendering node (SGNode)
// - maintains the private _sgNode property which referenced to SGNode
// - retain and release the SGNode
// - serializations for SGNode
// - notifications if some properties changed

var NodeWrapper = cc.Class({
    extends: cc.Object,

    properties: {
        _name: '',
        name: {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
        },
    },
    ctor: function () {
        if (cc.game._isCloning) {
            // create dynamically
            SceneGraphMaintainer.onEntityCreated(this);
        }
    },
});


(function () {

    // Define public getter and setter methods to ensure api compatibility.

    var SameNameGetSets = ['name', 'skewX', 'skewY', 'vertexZ', 'rotation', 'rotationX', 'rotationY',
                           'scale', 'scaleX', 'scaleY', 'children', 'childrenCount', 'parent', 'running',
                           'actionManager', 'scheduler', 'shaderProgram', 'opacity', 'color'];
    var DiffNameGetSets = {
        x: ['getPositionX', 'setPositionX'],
        y: ['getPositionY', 'setPositionY'],
        zIndex: ['getLocalZOrder', 'setLocalZOrder'],
        visible: ['isVisible', 'setVisible'],
        running: ['isRunning'],
        ignoreAnchor: ['isIgnoreAnchorPointForPosition', 'ignoreAnchorPointForPosition'],
        opacityModifyRGB: ['isOpacityModifyRGB'],
        cascadeOpacity: ['isCascadeOpacityEnabled', 'setCascadeOpacityEnabled'],
        cascadeColor: ['isCascadeColorEnabled', 'setCascadeColorEnabled'],
        //// privates
        //width: ['_getWidth', '_setWidth'],
        //height: ['_getHeight', '_setHeight'],
        //anchorX: ['_getAnchorX', '_setAnchorX'],
        //anchorY: ['_getAnchorY', '_setAnchorY'],
    };
    var propName, np = NodeWrapper.prototype;
    for (var i = 0; i < SameNameGetSets.length; i++) {
        propName = SameNameGetSets[i];
        var suffix = propName[0].toUpperCase() + propName.slice(1);
        var pd = Object.getOwnPropertyDescriptor(np, propName);
        //if (!pd) {
        //    cc.warn('cc.Node.' + propName + ' is undefined');
        //    continue;
        //}
        if (pd.get) np['get' + suffix] = pd.get;
        if (pd.set) np['set' + suffix] = pd.set;
    }
    for (propName in DiffNameGetSets) {
        var pd = Object.getOwnPropertyDescriptor(np, propName);
        //if (!pd) {
        //    cc.warn('cc.Node.' + propName + ' is undefined');
        //    continue;
        //}
        var getset = DiffNameGetSets[propName];
        np[getset[0]] = pd.get;
        if (getset[1]) np[getset[1]] = pd.set;
    }
})();

module.exports = NodeWrapper;
