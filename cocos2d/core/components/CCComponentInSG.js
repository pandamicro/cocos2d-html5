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
        // update color
        sgNode.setColor(this.node._color);
        sgNode.setOpacity(this.node._opacity);
        // update Size
        sgNode.setContentSize(this.node._contentSize);
        // update color
        sgNode.setAnchorPoint(this.node._anchorPoint);
        sgNode.ignoreAnchorPointForPosition(this.node._ignoreAnchorPointForPosition);

        sgNode.setOpacityModifyRGB(this.node._opacityModifyRGB);

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
