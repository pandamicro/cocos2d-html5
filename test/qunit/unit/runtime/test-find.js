module('cc.find', SetupEngine);

test('test', function () {
    var scene = new cc.Scene();
    cc.director.runScene(scene);

    var ent = new cc.Node();
    cc.getWrapper(ent).name = '';
    scene.addChild(ent);

    ok(cc.find('/') === ent, 'should found, empty name, path starts with sep');
    ok(cc.find('') === ent, 'should found, empty name');

    var ent2 = new cc.Node('.去');
    cc.getWrapper(ent2).name = '.去';
    scene.addChild(ent2);
    ok(cc.find('/.去') === ent2, 'should found, Chinese name, path starts with sep');
    ok(cc.find('.去') === ent2, 'should found, Chinese name');

    var entent = new cc.Node('');
    cc.getWrapper(entent).name = '';
    ent.addChild(entent);
    ok(cc.find('//') === entent, 'should found, empty name * 2');
    ok(cc.find('/', ent) === entent, 'should found by reference node, empty name * 2');

    var ent2ent2 = new cc.Node('Jare Guo');
    cc.getWrapper(ent2ent2).name = 'Jare Guo';
    ent2.addChild(ent2ent2);
    ok(cc.find('/.去/Jare Guo') === ent2ent2, 'should found, name contains space, path starts with sep');
    ok(cc.find('.去/Jare Guo') === ent2ent2, 'should found, name contains space');
    ok(cc.find('Jare Guo', ent2) === ent2ent2, 'should found by reference node, name contains space');

    var ent2ent2ent2 = new cc.Node('Knox');
    cc.getWrapper(ent2ent2ent2).name = 'Knox';
    ent2ent2.addChild(ent2ent2ent2);
    ok(cc.find('Jare Guo/Knox', ent2) === ent2ent2ent2, 'should found by reference node');
});
