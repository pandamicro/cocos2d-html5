/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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

// define cc

var getWrapper;
var root = typeof global !== 'undefined' ? global : window;

// `cc(node)` takes a runtime node and return its corresponding cc.Runtime.NodeWrapper instance.
var cc = function (node) {
    return getWrapper(node);
};
root.cc = cc;

cc._setWrapperGetter = function (getter) {
    getWrapper = getter;
};

// MACROS

// if global_defs not declared by uglify, declare them globally
// (use eval to ignore uglify)
if (typeof CC_EDITOR === 'undefined') {
    eval('CC_EDITOR=typeof Editor!=="undefined"');
}
if (typeof CC_DEV === 'undefined') {
    eval('CC_DEV=CC_EDITOR');
}
if (typeof CC_TEST === 'undefined') {
    if (CC_EDITOR) {
        eval('CC_TEST=typeof describe!=="undefined"');
    }
    else {
        eval('CC_TEST=typeof QUnit!=="undefined"');
    }
}
if (CC_TEST) {
    // contains internal apis for unit tests
    // @expose
    cc._Test = {};
}

// LOAD ORIGIN COCOS2D COMPILED BY CLOSURE

// preload some core modules for cocos
require('./cocos2d/core/platform/CCEnum');
require('./cocos2d/core/platform/js');

document.ccConfig = document.ccConfig || {
    debugMode: CC_DEV,
    renderMode: 0                 // 0: auto, 1: Canvas, 2: WebGL
};

require('./bin/modular-cocos2d');

// EXTENDS FOR FIREBALL

require('./cocos2d/core/platform');
require('./cocos2d/core/value-types');
require('./cocos2d/core/assets');

if (cc.sys.isBrowser) {
    // engine, runtime...
}

if (CC_EDITOR) {
    /**
     * In editor, in addition to the modules defined in cc scope, you can also access to the internal modules by using _require.
     * @method _require
     * @example
     * var isDomNode = cc._require('./cocos2d/core/platform/utils').isDomNode;
     */
    cc._require = require;
}

if (CC_EDITOR && cc.sys.platform === cc.sys.EDITOR_CORE) {
    cc.isRuntimeNode = function () {
        return false;
    };
    getWrapper = function () {
        return null;
    };
    Editor.versions['cocos2d'] = require('./package.json').version;
}
else {
    require('./cocos2d/deprecated');

    //cc.Runtime = require('./runtime/index');
    cc.isRuntimeNode = cc.getWrapperType;   // 由于是借助 wrapper 来判断，所以该方法只有在 wrapper 都注册好后才有效
}

module.exports = cc;
