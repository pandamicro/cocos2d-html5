module('Fire.find', SetupEngine);

test('test', function () {
    var MyScene = cc.FireClass({
        extends: TestNode
    });
    var MySceneWrapper = cc.FireClass({
        extends: Fire.Runtime.SceneWrapper,
        properties: {
            childrenN: {
                get: function () {
                    return this.targetN.children;
                }
            }
        }
    });
    Fire.Runtime.registerNodeType(MyScene, MySceneWrapper);

    var scene = new MyScene();
    Fire.engine._setCurrentSceneN(scene);

    var ent = new TestNode('');
    scene.children = [ent];

    ok(Fire.find('/') === ent, 'should found, empty name, path starts with sep');
    ok(Fire.find('') === ent, 'should found, empty name');

    var ent2 = new TestNode('.去');
    scene.children = [ent, ent2];
    ok(Fire.find('/.去') === ent2, 'should found, Chinese name, path starts with sep');
    ok(Fire.find('.去') === ent2, 'should found, Chinese name');

    var entent = new TestNode('');
    ent.children = [entent];
    ok(Fire.find('//') === entent, 'should found, empty name * 2');
    ok(Fire.find('/', ent) === entent, 'should found by reference node, empty name * 2');

    var ent2ent2 = new TestNode('Jare Guo');
    ent2.children = [ent2ent2];
    ok(Fire.find('/.去/Jare Guo') === ent2ent2, 'should found, name contains space, path starts with sep');
    ok(Fire.find('.去/Jare Guo') === ent2ent2, 'should found, name contains space');
    ok(Fire.find('Jare Guo', ent2) === ent2ent2, 'should found by reference node, name contains space');

    var ent2ent2ent2 = new TestNode('Knox');
    ent2ent2.children = [ent2ent2ent2];
    ok(Fire.find('Jare Guo/Knox', ent2) === ent2ent2ent2, 'should found by reference node');
});
