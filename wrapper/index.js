
/**
 * ** THIS MODULE SHOULD BE REMOVED IF MIGRATED TO EC **
 * This module provides interfaces for runtime implementation.
 * @module cc.Runtime
 * @main
 */

var Runtime = {};

var JS = cc.js;
var getClassName = JS.getClassName;

var NodeWrapper = require('./wrappers/node');

//This dictionary stores all the registered WrapperTypes, and use MenuPath as key.
//@property menuToWrapper
//@type {object}
var menuToWrapper = {};

/**
 * 通过注册 runtime 的 type 为某个解释器, 使得这份 type 具备序列化, Inspector 中展示的能力
 * @method registerNodeType
 * @param {function} nodeType
 * @param {NodeWrapper} nodeWrapper
 * @param {string} [menuPath] - Optional, the menu path name. Eg. "Rendering/Camera"
 */
function registerNodeType (nodeType, nodeWrapper, menuPath) {
    if (! cc.isChildClassOf(nodeWrapper, NodeWrapper)) {
        cc.error('%s must be child class of %s!', getClassName(nodeWrapper), getClassName(NodeWrapper));
        return;
    }
    if (nodeType.prototype.hasOwnProperty('_FB_WrapperType')) {
        cc.error('%s is already registered!', getClassName(nodeType));
        return;
    }

    nodeType.prototype._FB_WrapperType = nodeWrapper;

    if (menuPath) {
        menuToWrapper[menuPath] = nodeWrapper;
    }
}

function registerToCore () {
    if (CC_EDITOR) {
        // register create node menu
        var menuTmpl = [];
        for (var menuPath in menuToWrapper) {
            var basename = menuPath.split('/').slice(-1)[0];
            menuTmpl.push({
                label: menuPath,
                message: 'scene:create-node-by-classid',
                params: [
                    'New ' + basename,
                    JS._getClassId(menuToWrapper[menuPath])
                ],
            });
        }
        Editor.sendToCore('app:register-menu', 'create-node', menuTmpl);
    }
}

cc.js.mixin(Runtime, {
    NodeWrapper: NodeWrapper,
    SceneWrapper: require('./wrappers/scene'),
    registerNodeType: registerNodeType,
    registerToCore: registerToCore,

    Helpers: require('./helpers')
});

// load utility methods
require('./extends/node-extends');
require('./extends/scene-extends');

// settings for editor
Runtime.Settings = {
    "mapping-v": [1, 0, 1],
    "mapping-h": [0, 1, 1],
};

/**
 * @module cc
 */
/**
 * 返回已注册的 NodeWrapper 类型，如果 nodeOrNodeType 是实例，则返回自身类型对应的 NodeWrapper 或继承树上方的最近一个注册的 NodeWrapper。
 * 如果 nodeOrNodeType 是构造函数，则只返回自身对应的 NodeWrapper。
 * @method getWrapperType
 * @param {object|function} nodeOrNodeType
 * @return {cc.Runtime.NodeWrapper|undefined}
 */
cc.getWrapperType = function (nodeOrNodeType) {
    if (typeof nodeOrNodeType !== 'function') {
        return nodeOrNodeType && nodeOrNodeType._FB_WrapperType;
    }
    else {
        return nodeOrNodeType.prototype._FB_WrapperType;
    }
};

require('./behavior');
var mixin = require('./mixin');
cc.mixin = mixin.mixin;
cc.hasMixin = mixin.hasMixin;
cc.unMixin = mixin.unMixin;

cc.find = require('./find');

require('./utils');

if (cc.sys.isNative) {
    // TODO - add to jsb ?
    function log () {
        var text = cc.formatStr.apply(this, arguments);
        console.log(text);
    }
    cc.log   = log;
    cc.error = log;
    cc.warn  = log;
    cc.info  = log;
}

// register node type
var wrappers = require('./wrappers');

wrappers.forEach(function (type) {
    var namespace = type[0];
    var name = type[1];
    var wrapper = type[2];
    var menuPath = type[3];
    var nodeType = namespace[name];

    //var originCtor = nodeType.ctor;
    //nodeType = function () {
    //    originCtor.apply(this, arguments);
    //    this._FB_wrapper = null;
    //};

    registerNodeType(nodeType, wrapper, menuPath);

    namespace[name] = nodeType;
});

module.exports = Runtime;
