var SceneGraphHelper = require('../utils/scene-graph-helper');

/**
 * Component in scene graph.
 * This is the base class for components which will attach a node to the cocos2d scene graph.
 *
 * @class
 * @name cc.ComponentInSG
 * @extend cc.Component
 */
var ComponentInSG = cc.Class({
    extends: require('./CCComponent'),

    ctor: function () {
        this._sgNode = null;
    },

    onLoad: function () {
        var sgNode = this._createSgNode();
        this._appendSgNode(sgNode);
    },
    onEnable: function () {
        if (this._sgNode) {
            this._sgNode.visible = true;
        }
    },
    onDisable: function () {
        if (this._sgNode) {
            this._sgNode.visible = false;
        }
    },
    onDestroy: SceneGraphHelper.removeSgNode,

    _appendSgNode: function (sgNode) {
        // TODO - 初始化不会继承自父物体的属性，同时这些属性要监听来自父物体的变更
        //var entity = this.node;
        //node.setContentSize(entity._size);
        //
        //if (this._scale) {
        //    node.scaleX = this._scale[0];
        //    node.scaleY = this._scale[1];
        //}
        //

        // update color
        sgNode.setColor(this.node._color);
        sgNode.setOpacity(this.node._opacity / 255);
        // update Size
        sgNode.setContentSize(this.node._contentSize);
        // update color
        sgNode.setAnchorPoint(this.node._anchorPoint);
        sgNode.ignoreAnchorPointForPosition(this.node._ignoreAnchorPointForPosition);

        // set z order to -1 to make sure component will rendered before all of its entity's children.

        sgNode.setLocalZOrder(-1);

        var sgParent = this.node._sgNode;
        sgParent.addChild(sgNode);

        // retain immediately
        sgNode.retain();
        this._sgNode = sgNode;
    }
});

cc.executeInEditMode(ComponentInSG);
cc._ComponentInSG = module.exports = ComponentInSG;
