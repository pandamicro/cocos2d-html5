module('wrapper');

test('Node', function() {
    var MyNode = cc.Class();
    var MyNodeWrapper = cc.Class({
        extends: cc.Runtime.NodeWrapper,
        statics: {
        }
    });
    cc.Runtime.registerNodeType(MyNode, MyNodeWrapper);

    var node = new MyNode();
    var nodeWrapper = cc(node);

    strictEqual(nodeWrapper.targetN, node, 'target of wrapper');
    strictEqual(nodeWrapper.isScene, false, 'not scene');
});

test('SceneNode', function() {
    var dummyScene;
    var MyScene = cc.Class();
    var MySceneWrapper = cc.Class({
        extends: cc.Runtime.SceneWrapper,
    });
    //cc.engine.getCurrentSceneNode = function () {
    //    return dummyScene;
    //};

    cc.Runtime.registerNodeType(MyScene, MySceneWrapper);

    dummyScene = new MyScene();
    var dummySceneWrapper = cc(dummyScene);

    //strictEqual(cc.engine.getCurrentScene(), dummySceneWrapper, 'could get current scene wrapper');

    strictEqual(dummySceneWrapper.isScene, true, 'isScene');
});

test('root', function() {
    var MyNode = cc.Class({
        ctor: function () {
            this.parent = null;
        }
    });
    var MyNodeWrapper = cc.Class({
        extends: cc.Runtime.NodeWrapper,
        properties: {
            parentN: {
                get: function () {
                    return this.targetN.parent;
                },
                set: function (value) {
                    this.targetN.parent = value;
                }
            }
        }
    });
    var MyScene = cc.Class();
    var MySceneWrapper = cc.Class({
        extends: cc.Runtime.SceneWrapper,
    });
    cc.Runtime.registerNodeType(MyNode, MyNodeWrapper);
    cc.Runtime.registerNodeType(MyScene, MySceneWrapper);

    var node = new MyNode();
    var nodeWrapper = cc(node);
    var node2 = new MyNode();
    var nodeWrapper2 = cc(node2);
    var scene = new MyScene();
    var sceneWrapper = cc(scene);

    strictEqual(nodeWrapper.root, nodeWrapper, 'root should be itself if no parent');

    node.parent = node2;
    strictEqual(nodeWrapper.root, nodeWrapper2, 'root should be parent');

    node2.parent = scene;
    strictEqual(nodeWrapper.root, sceneWrapper, 'root should be top most parent(scene)');
});
