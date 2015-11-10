/**
 * @module cc
 */

var SceneGraphHelper = require('../utils/scene-graph-helper');

/**
 * Component in scene graph.
 * This is the base class for components which will attach a node to the cocos2d scene graph.
 *
 * @class ComponentInSG
 * @extends Component
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
        var node = this.node;

        if ( !node._cascadeColorEnabled ) {
            sgNode.setColor(node._color);
        }
        if ( !node._cascadeOpacityEnabled ) {
            sgNode.setOpacity(node._opacity);
        }

        sgNode.setContentSize(node._contentSize);

        sgNode.setAnchorPoint(node._anchorPoint);
        sgNode.ignoreAnchorPointForPosition(node._ignoreAnchorPointForPosition);

        sgNode.setOpacityModifyRGB(node._opacityModifyRGB);

        // set z order to -1 to make sure component will rendered before all of its entity's children.

        sgNode.setLocalZOrder(-1);

        var sgParent = node._sgNode;
        sgParent.addChild(sgNode);

        // retain immediately
        sgNode.retain();
        this._sgNode = sgNode;
    }
});

cc.executeInEditMode(ComponentInSG);
cc._ComponentInSG = module.exports = ComponentInSG;
