largeModule('SpriteRenderer');

test('basic test', function () {
    var node = new cc.ENode();
    cc.director.getScene().addChild(node);

    node.color = Color.RED;
    var render = node.addComponent(cc.SpriteRenderer);

    deepEqual(render._sgNode.color, Color.RED, 'color set success');

    render.textureAtlas = 'qweasd.png';
    strictEqual(render._sgNode.textureAtlas, 'qweasd.png', 'textureAtlas set success');

    var path = 'aabbcc.png';
    var restore = cc.loader.loadImg;
    cc.loader.loadImg = function (url, callback) {
        if (url.endsWith(path)) {
            callback(null, new Image());
        }
        else {
            restore(url, callback);
        }
    }
    render.texture = 'aabbcc.png';
    strictEqual(render._sgNode.texture.url, 'aabbcc.png', 'texture set success');

    cc.loader.loadImg = restore;
});
