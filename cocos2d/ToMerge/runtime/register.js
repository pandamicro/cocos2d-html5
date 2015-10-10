/**
 * @module Fire.Runtime
 */

var JS = cc.js;
var getClassName = JS.getClassName;

var NodeWrapper = require('./wrappers/node');
var SceneWrapper = require('./wrappers/scene');
var EngineWrapper = require('./wrappers/engine');

//var runtimeSceneWrapper = null;
var runtimeMixinOptions = null;

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
    //if (cc.isChildClassOf(nodeWrapper, SceneWrapper)) {
    //    if (!CC_TEST && runtimeSceneWrapper) {
    //        cc.error('The %s can only register once!', getClassName(SceneWrapper));
    //    }
    //    else {
    //        runtimeSceneWrapper = nodeWrapper;
    //    }
    //}

    nodeType.prototype._FB_WrapperType = nodeWrapper;

    // TODO - 菜单应该在 package.json 里注册
    if (menuPath) {
        menuToWrapper[menuPath] = nodeWrapper;
    }
}

/**
 * 通过注册 mixin 的描述来让 engine-framework 懂得如何 mixin 一份 FireClass 到 runtime 的 nodeType 中。
 * @method registerMixin
 * @param {object} mixinOptions
 * @param {function} mixinOptions.mixin - mixin method
 */
function registerMixin (mixinOptions) {
    runtimeMixinOptions = mixinOptions;
}

/**
 * 注册一份引擎实例，注册后的引擎可以通过 Fire.engine 进行访问。
 * @method registerEngine
 * @param {EngineWrapper} engineInstance
 */
function registerEngine (engineInstance) {
    if (CC_EDITOR) {
        if (!(engineInstance instanceof EngineWrapper)) {
            cc.error('The engine to register must be child class of %s', getClassName(EngineWrapper));
            return;
        }
        if (Fire.engine) {
            cc.error('The engine is already registered!');
            return;
        }
    }
    Fire.engine = engineInstance;
}

/**
 * @module Fire
 */

/**
 * @property {EngineWrapper} engine - The instance of current registered engine.
 */

/**
 * 返回已注册的 NodeWrapper 类型，如果 nodeOrNodeType 是实例，则返回自身类型对应的 NodeWrapper 或继承树上方的最近一个注册的 NodeWrapper。
 * 如果 nodeOrNodeType 是构造函数，则只返回自身对应的 NodeWrapper。
 * @method getWrapperType
 * @param {object|function} nodeOrNodeType
 * @return {Fire.Runtime.NodeWrapper|undefined}
 */
function getWrapperType (nodeOrNodeType) {
    if (typeof nodeOrNodeType !== 'function') {
        return nodeOrNodeType && nodeOrNodeType._FB_WrapperType;
    }
    else {
        return nodeOrNodeType.prototype._FB_WrapperType;
    }
}

//// 值得注意的是, 不同的 runtime 中, 他们 runtimeType 的 mixin 的关键字将会有些许变动, 比如: 有些 runtime 的 node 不支持 event,
//// 那么 listeners 关键字: 在这些 runtime 中将会失效, 我们可以 warning user.
//Fire.registerMixin = require('./mixin');
//

module.exports = {
    registerNodeType: registerNodeType,
    getWrapperType: getWrapperType,
    //getRegisteredSceneWrapper: function () {
    //    return runtimeSceneWrapper;
    //},

    registerToCoreLevel: function () {
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
    },

    registerMixin: registerMixin,
    /**
     * get current registered mixin options
     * @method getMixinOptions
     * @return {object}
     */
    getMixinOptions: function () {
        return runtimeMixinOptions;
    },

    registerEngine: registerEngine
};
