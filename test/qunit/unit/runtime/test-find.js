module('cc.find', SetupEngine);

test('test', function () {
    var MyScene = cc.Scene;
    var MySceneWrapper = cc.Runtime.SceneWrapper;

    var scene = new MyScene();
    cc.director.runScene(scene);
    cc.director.setNextScene();

    var ent = new TestNode('');
    scene.children = [ent];

    ok(cc.find('/') === ent, 'should found, empty name, path starts with sep');
    ok(cc.find('') === ent, 'should found, empty name');

    var ent2 = new TestNode('.去');
    scene.children = [ent, ent2];
    ok(cc.find('/.去') === ent2, 'should found, Chinese name, path starts with sep');
    ok(cc.find('.去') === ent2, 'should found, Chinese name');

    var entent = new TestNode('');
    ent.children = [entent];
    ok(cc.find('//') === entent, 'should found, empty name * 2');
    ok(cc.find('/', ent) === entent, 'should found by reference node, empty name * 2');

    var ent2ent2 = new TestNode('Jare Guo');
    ent2.children = [ent2ent2];
    ok(cc.find('/.去/Jare Guo') === ent2ent2, 'should found, name contains space, path starts with sep');
    ok(cc.find('.去/Jare Guo') === ent2ent2, 'should found, name contains space');
    ok(cc.find('Jare Guo', ent2) === ent2ent2, 'should found by reference node, name contains space');

    var ent2ent2ent2 = new TestNode('Knox');
    ent2ent2.children = [ent2ent2ent2];
    ok(cc.find('Jare Guo/Knox', ent2) === ent2ent2ent2, 'should found by reference node');
});
