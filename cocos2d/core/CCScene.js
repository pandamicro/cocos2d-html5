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

var SceneGraphMaintainer = require('./utils/scene-graph-maintainer');

/**
 * <p>cc.Scene is a subclass of cc.Node that is used only as an abstract concept.</p>
 * <p>cc.Scene and cc.Node are almost identical with the difference that users can not modify cc.Scene manually. </p>
 *
 * @class
 */
cc.EScene = cc.Class({
    name: 'cc.Scene',
    extends: require('./utils/node-wrapper'),
    ctor: function () {
        if (cc.game._isCloning) {
            this._activeInHierarchy = false;
        }
        else {
            // create dynamically
            this._activeInHierarchy = true;
            SceneGraphMaintainer.onSceneCreated(this);
        }
    },
});

module.exports = cc.EScene;
