
largeModule('Prefab', {
    setup: function () {
        _resetGame();
        AssetLibrary.init('../assets/library');
    }
});

test('basic test', function() {
    var node = new TestNode();
    strictEqual(cc(node)._prefab, null, "new object should not have prefab info");
});

(function () {

    var UUID = '19851210';
    var OUTPUT_PREFAB = 0;

    var node = new TestNode();
    var child = new TestNode();
    var otherNode = new TestNode();

    var wrapper = cc(node);
    cc(child).parent = wrapper;
    wrapper.scale = cc.v2(123, 432);
    child.scale = cc.v2(22, 11);
    var ensureIdInitialized = wrapper.uuid;
    cc.mixin(node, TestScript);
    node.target = child;
    node.target2 = otherNode;

    var prefab;
    var prefabJson;

    (function () {
        prefab = new cc._Prefab();
        var w = cc.instantiate(wrapper);
        w._id = '';
        c = w.children[0];
        c._id = '';
        w.target2 = null;
        prefab.data = {
            w: w,
            t: w.targetN,
            m: [cc.js._getClassId(TestScript)],
            c: [
                {
                    w: c,
                    t: c.targetN,
                }
            ]
        };
        prefab._uuid = UUID;
    })();

    // TODO - create operation should be tested in editor
    //(function savePrefab () {
    //    prefab = Editor.PrefabUtils.createPrefabFrom(node);
    //    Editor.PrefabUtils.savePrefabUuid(wrapper, UUID);
    //
    //    // 已经加载好的 prefab，去除类型，去除 runtime node
    //    prefabJson = Editor.serialize(prefab);
    //    if (OUTPUT_PREFAB) {
    //        console.log(prefabJson);
    //    }
    //    prefab = cc.deserialize(prefabJson);
    //    prefab._uuid = UUID;
    //})();
    //
    //test('create prefab', function () {
    //    var prefabInfo = wrapper._prefab;
    //
    //    ok(prefab !== null, "prefab asset should be created");
    //    ok(prefabInfo !== null, "wrapper should preserve the prefab info");
    //    ok(prefabInfo.asset instanceof cc.Asset, "the prefab asset should be preserved");
    //    strictEqual(prefabInfo.asset._uuid, UUID, "the prefab asset should be preserved");
    //
    //    var wrapperToSave = prefab.data.w;
    //    ok(wrapperToSave instanceof TestWrapper, 'Checking prefab data');
    //    ok(!wrapperToSave._id, 'The id in prefab data should be cleared');
    //    ok(wrapperToSave._serializeData.scale.equals(cc.v2(123, 432)), 'Checking prefab data');
    //    ok(prefab.data.t.target === prefab.data.c[0].w, 'Would save mixin node as wrapper');
    //    ok(prefab.data.t.target2 === null, 'Should not save other nodes in the scene');
    //    strictEqual(prefab.data.m, cc.js._getClassId(TestScript), 'Would save mixin script id');
    //
    //    var childWrapperToSave = prefab.data.c[0].w;
    //    ok(childWrapperToSave, 'Should save child wrapper');
    //    ok(childWrapperToSave._serializeData.scale.equals(cc.v2(22, 11)), 'Checking child wrapper');
    //});

    test('instantiate prefab', function () {
        var newNode = cc.instantiate(prefab);
        var newNode2 = cc.instantiate(prefab);
        var newWrapper = cc(newNode);
        var newWrapper2 = cc(newNode2);
        var prefabInfo = newWrapper._prefab;

        ok(newNode !== null, "new node should be created");
        ok(prefabInfo !== null, "new wrapper should preserve the prefab info");
        ok(prefabInfo.asset === prefab, "should reference to origin prefab asset in prefab info");
        notEqual(newNode, newNode2, 'The new nodes should be different');
        notEqual(newWrapper, newWrapper2, 'The new wrappers should be different');

        ok(newNode instanceof TestNode, 'Checking instance');
        ok(newWrapper instanceof TestWrapper, 'Checking instance');
        notEqual(newWrapper.uuid, newWrapper2.uuid, 'The id of instances should be different');
        ok(newWrapper.scale.equals(cc.v2(123, 432)), 'Checking instance');
        ok(cc.hasMixin(newNode, TestScript), 'Should mixin script');
        ok(newNode.target === newNode.children[0], 'Should restore mixin property');

        ok(newNode.children.length === 1, 'Should load child');
        ok(newNode.children[0].scale.equals(cc.v2(22, 11)), 'Checking child');
    });

    // TODO - revert operation should be tested in editor
    //asyncTest('revert prefab', function () {
    //    // stub
    //    var restore = cc.loader.loadJson;
    //    cc.loader.loadJson = function (url, callback) {
    //        if (url.endsWith(UUID + '.json')) {
    //            callback(null, prefabJson);
    //        }
    //        else {
    //            restore(url, callback);
    //        }
    //    };
    //
    //    var testNode = cc.instantiate(prefab);
    //    var testChildN = testNode.children[0];
    //    var testWrapper = cc(testNode);
    //
    //    testNode.scale = cc.Vec2.zero;
    //    cc.unMixin(testNode, TestScript);
    //    testChildN.scale = cc.Vec2.zero;
    //    cc.mixin(testChildN, TestScript);
    //
    //    var newNode = new TestNode();
    //    cc(newNode).parentN = testChildN;
    //
    //    Editor.PrefabUtils.revertPrefab(testWrapper, function () {
    //        cc.loader.loadJson = restore;
    //        ok(testNode.scale.equals(cc.v2(123, 432)), 'Revert parent');
    //        strictEqual(cc.hasMixin(testNode, TestScript), true, 'Restore removed mixin');
    //        ok(testNode.children[0].scale.equals(cc.v2(22, 11)), 'Revert child');
    //        strictEqual(cc.hasMixin(testChildN, TestScript), false, 'Remove added mixin');
    //
    //        ok(testNode.target instanceof TestNode, 'Should convert wrapper to node');
    //        ok(testNode.target === testChildN, 'Should redirect reference to scene node');
    //
    //        strictEqual(testChildN.children.length, 0, 'Should remove new node');
    //
    //        start();
    //    });
    //});
})();
