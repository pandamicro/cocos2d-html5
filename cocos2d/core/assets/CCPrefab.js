function visitWrapper (wrapper, visitor) {
    visitor(wrapper);

    var children = wrapper._children;
    for (var i = 0; i < children.length; i++) {
        visitor(children[i]);
    }
}

var Prefab = cc.Class({
    name: 'cc.Prefab',
    extends: cc.Asset,

    properties: {
        data: null
    },

    createNode: function (cb) {
        if (CC_EDITOR) {
            var node = cc.instantiate(this);
            cb(null, node);
        }
    },

    _instantiate: function () {
        var initNodeAndChildren = cc.Runtime.NodeWrapper._initNodeAndChildren;
        var wrapperToNode = new cc.deserialize.W2NMapper();

        // instantiate wrappers
        var data = cc.instantiate._clone(this.data, null, wrapperToNode);

        var newWrapper = data.w;

        // create nodes
        cc.game._isCloning = true;
        initNodeAndChildren([data], null, wrapperToNode);
        cc.game._isCloning = false;

        // reassociate nodes
        wrapperToNode.apply();

        newWrapper._onAfterInstantiate();

        if (CC_EDITOR || CC_TEST) {
            Editor.PrefabUtils.onPrefabInstantiated(this, newWrapper);
        }

        return newWrapper;
    }
});

cc._Prefab = module.exports = Prefab;
