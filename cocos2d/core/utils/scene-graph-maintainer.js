
// typedef: internal node types in scene graph
var SGNode = cc.Node;
var SGScene = cc.Scene;

// typedef: entity node types
var Entity = require('../CCNode');
var Scene = require('../CCScene');

// called after changing parent
function setMaxZOrder (node) {
    var siblings = node._parent.getChildren();
    var z = 0;
    if (siblings.length >= 2) {
        var prevNode = siblings[siblings.length - 2];
        z = prevNode.getOrderOfArrival() + 1;
    }
    node.setOrderOfArrival(z);
    return z;
}

/**
 * Maintains the actual scene graph for Entity-Component.
 *
 * 渲染采用 arrivalOrder 来排序，所有 node 的 arrivalOrder 都会被设置成所属 entity 的 sibling index，以保证渲染顺序一致。
 * 而 Component 的节点 order 则会设为 -1，保证在子节点之前渲染。
 */
var SceneGraphMaintainer = {

    removeSgNode: function () {
        var node = this._sgNode;
        if (node) {
            if (node._parent) {
                node._parent.removeChild(node);
            }

            // release
            this._sgNode.release();
            this._sgNode = null;
        }
    },
    onEntityParentChanged: function (entity) {
        var node = entity._sgNode;
        if (node) {
            node.removeFromParent();
            var parent = entity._parent._sgNode;
            parent.addChild(node);
            setMaxZOrder(node);
        }
    },
    onEntityIndexChanged: function (entity) {
        var siblings = entity._parent._children;
        for (var i = 0, len = siblings.length; i < len; i++) {
            var sibling = siblings[i];
            sibling._sgNode.setOrderOfArrival(i);
        }
    },
    onEntityCreated: function (entity) {
        var node = new SGNode();

        // retain immediately
        node.retain();
        entity._sgNode = node;

        node.setAnchorPoint(0, 1);
        if (entity._parent) {
            entity._parent._sgNode.addChild(node);
        }
        var children = entity._children;
        for (var i = 0, len = children.length; i < len; i++) {
            this.onEntityCreated(children[i]);
        }
    },
    onSceneLoaded: function (scene) {
        var sgNode = new SGScene();

        // retain immediately
        sgNode.retain();
        scene._sgNode = sgNode;

        sgNode.setAnchorPoint(0, 1);
        var children = scene._children;
        for (var i = 0, len = children.length; i < len; i++) {
            this.onEntityCreated(children[i]);
        }
    }
};

if (CC_DEV) {
    SceneGraphMaintainer._getChildrenOffset = function (entityParent) {
        if (entityParent) {
            var sgParent = entityParent._sgNode;
            var firstChildEntity = entityParent._children[0];
            if (firstChildEntity) {
                var firstChildSg = firstChildEntity._sgNode;
                var offset = sgParent._children.indexOf(firstChildSg);
                if (offset !== -1) {
                    return offset;
                }
                else {
                    cc.error("%s's scene graph node not contains in the parent's children", firstChildEntity.name);
                    return -1;
                }
            }
            else {
                return sgParent._children.length;
            }
        }
        else {
            return 0;   // the root of hierarchy
        }
    };
    SceneGraphMaintainer.checkMatchCurrentScene = function () {
        var scene = cc.game._scene;
        var sgScene = cc.director.getRunningScene();
        function checkMatch (ent, sgNode) {
            if (ent._sgNode !== sgNode) {
                throw new Error('scene graph node not equal: ' + ent.name);
            }

            var childCount = ent._children.length;
            var childrenOffset = SceneGraphMaintainer._getChildrenOffset(ent);
            if (sgNode._children.length !== childCount + childrenOffset) {
                throw new Error('Mismatched child scene graphs: ' + ent.name);
            }
            for (var i = 0; i < childCount; i++) {
                checkMatch(ent._children[i], sgNode._children[childrenOffset + i]);
            }
        }

        checkMatch(scene, sgScene);
    };
}

module.exports = SceneGraphMaintainer;
