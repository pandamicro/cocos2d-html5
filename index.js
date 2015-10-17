/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2015 Chukong Technologies Inc.

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

require('./polyfill');

// DEFINE CC

var root = typeof global !== 'undefined' ? global : window;

// `cc(node)` takes a runtime node and return its corresponding cc.Runtime.NodeWrapper instance.
var getWrapper;
var cc = function (node) {
    return getWrapper(node);
};
root.cc = cc;

cc._setWrapperGetter = function (getter) {
    getWrapper = getter;
};

// MACROS

// if "global_defs" not preprocessed by uglify, just declare them globally
// (use eval to prevent the uglify from renaming symbols)
if (typeof CC_TEST === 'undefined') {
    eval('CC_TEST=typeof describe!=="undefined"||typeof QUnit!=="undefined"');
}
if (typeof CC_EDITOR === 'undefined') {
    eval('CC_EDITOR=typeof Editor!=="undefined"');
}
if (typeof CC_DEV === 'undefined') {
    eval('CC_DEV=CC_EDITOR');
}

if (CC_TEST) {
    /**
     * contains internal apis for unit tests
     * @expose
     */
    cc._Test = {};
}

var isCoreLevel = CC_EDITOR && Editor.isCoreLevel;

// PRELOAD SOME MODULES FOR COCOS

require('./cocos2d/core/platform/js');
require('./cocos2d/core/value-types');
require('./cocos2d/core/utils');
require('./cocos2d/core/platform/CCInputManager');
require('./cocos2d/core/platform/CCInputExtension');
require('./cocos2d/core/platform/CCSys');
require('./cocos2d/core/platform/CCLoader');
require('./CCDebugger');

if (!isCoreLevel) {
    // LOAD ORIGIN COCOS2D COMPILED BY CLOSURE
    root.ccui = {};
    root.ccs = {};
    root.sp = {};
    root.cp = {};
    require('./bin/modular-cocos2d');
}
else {
    // load modules for editor's core-level which included in modular-cocos2d.js
    cc._initDebugSetting(1);    // DEBUG_MODE_INFO
}

// LOAD EXTENDS FOR FIREBALL

require('./cocos2d/core/platform');
require('./cocos2d/core/assets');

if (CC_EDITOR) {
    /**
     * In editor, in addition to the modules defined in cc scope, you can also access to the internal modules by using _require.
     * @method _require
     * @example
     * var isDomNode = cc._require('./cocos2d/core/platform/utils').isDomNode;
     */
    cc._require = require;
}

if (isCoreLevel) {
    cc.isRuntimeNode = function () {
        return false;
    };
    getWrapper = function () {
        return null;
    };
    Editor.versions['cocos2d'] = require('./package.json').version;
}
else {
    cc.Runtime = require('./wrapper');
    cc.isRuntimeNode = cc.getWrapperType;   // 由于是借助 wrapper 来判断，所以该方法只有在 wrapper 都注册好后才有效

    require('./cocos2d/deprecated');
}

module.exports = cc;
