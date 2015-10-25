if (TestEditorExtends) {

    largeModule('Node serialization');

    function getRandomInt() {
        return Math.floor(Math.random() * 1000);
    }

    function getSpecRandomInt(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    }

    function getRandomDouble() {
        return Math.random(0, 1000);
    }

    function getRandomBool() {
        var temp = getRandomInt(0, 1000);
        return (temp >= 500);
    }

    var compareKeys = [
        '_localZOrder',
        '_globalZOrder',
        '_vertexZ',
        '_rotationX',
        '_rotationY',
        '_scaleX',
        '_scaleY',
        '_position',
        '_normalizedPosition',
        '_usingNormalizedPosition',
        '_skewX',
        '_skewY',
        '_visible',
        '_anchorPoint',
        '_contentSize',
        '_ignoreAnchorPointForPosition',
        'tag',
        'userData',
        'userObject',
        '_name',
        '_showNode',
        '_realOpacity',
        '_realColor',
        '_cascadeColorEnabled',
        '_cascadeOpacityEnabled',
        '__type__'
    ];

    function createNodeData(nodeName) {
        return {
            '_localZOrder' : getRandomInt(),
            '_globalZOrder' : getRandomInt(),
            '_vertexZ' : getRandomDouble(),
            '_rotationX' : getRandomDouble(),
            '_rotationY' : getRandomDouble(),
            '_scaleX' : 1.5,
            '_scaleY' : 1.5,
            '_position' : cc.p(getRandomDouble(), getRandomDouble()),
            '_normalizedPosition' : cc.p(getRandomDouble(), getRandomDouble()),
            '_usingNormalizedPosition' : getRandomBool(),
            '_skewX' : getRandomDouble(),
            '_skewY' : getRandomDouble(),
            '_visible' : getRandomBool(),
            '_anchorPoint' : cc.p(getRandomDouble(), getRandomDouble()),
            '_contentSize' : cc.size(getRandomDouble(), getRandomDouble()),
            '_ignoreAnchorPointForPosition' : getRandomBool(),
            'tag' : getRandomInt(),
            'userData' : {mydata: nodeName},
            'userObject' : {myobj: nodeName},
            '_name' : nodeName,
            '_showNode' : getRandomBool(),
            '_realOpacity' : getSpecRandomInt(0, 256),
            '_realColor' : cc.color(getSpecRandomInt(0, 256), getSpecRandomInt(0, 256), getSpecRandomInt(0, 256), getSpecRandomInt(0, 256)),
            '_cascadeColorEnabled' : getRandomBool(),
            '_cascadeOpacityEnabled' : getRandomBool(),
            '__type__' : 'cc.Node'
        };
    }

    function createNode(nodeName) {
        var ret = new cc.ENode();

        ret._localZOrder = getRandomInt();
        ret._globalZOrder = getRandomInt();
        ret._vertexZ = getRandomDouble();
        ret._rotationX = getRandomDouble();
        ret._rotationY = getRandomDouble();
        ret._scaleX = 1.5;
        ret._scaleY = 1.5;
        ret._position = cc.p(getRandomDouble(), getRandomDouble());
        ret._normalizedPosition = cc.p(getRandomDouble(), getRandomDouble());
        ret._usingNormalizedPosition = getRandomBool();
        ret._skewX = getRandomDouble();
        ret._skewY = getRandomDouble();
        ret._visible = getRandomBool();
        ret._anchorPoint = cc.p(getRandomDouble(), getRandomDouble());
        ret._contentSize = cc.size(getRandomDouble(), getRandomDouble());
        ret._ignoreAnchorPointForPosition = getRandomBool();
        ret.tag = getRandomInt();
        ret.userData = {mydata: nodeName};
        ret.userObject = {myobj: nodeName};
        ret._name = nodeName;
        ret._showNode = getRandomBool();
        ret._realOpacity = getSpecRandomInt(0, 256);
        ret._realColor = cc.color(getSpecRandomInt(0, 256), getSpecRandomInt(0, 256), getSpecRandomInt(0, 256), getSpecRandomInt(0, 256));
        ret._cascadeColorEnabled = getRandomBool();
        ret._cascadeOpacityEnabled = getRandomBool();
        ret.__type__ = 'cc.Node';

        return ret;
    }

    function checkNodeData(originData, node) {
        for (var prop in originData) {
            if (originData.hasOwnProperty(prop))
                equal(node.prop, originData.prop, '"' + prop + '" should be equal between serialize data & node data.');
        }
    }

    function compare2Nodes(node1, node2) {
        for (var i in compareKeys) {
            var key = compareKeys[i];
            equal(node1.key, node2.key, '"' + key + '" should be equal between two nodes.');
        }

        equal(node1.getChildrenCount(), node2.getChildrenCount(), 'The children count should be equal between two nodes.');
        if (node1.getChildrenCount() > 0) {
            for (var i in node1.getChildren()) {
                compare2Nodes(node1.getChildren()[i], node2.getChildren()[i], 'The children content should be equal between two nodes.');
            }
        }
    }

    test('basic test deserialize', function () {
        var nodeData = createNodeData('rootNode');
        var rootNode = cc.deserialize(nodeData);
        checkNodeData(nodeData, rootNode);
    });

    test('basic test serialize', function() {
        var node = createNode('rootNode');
        var json = JSON.parse(Editor.serialize(node));
        checkNodeData(json, node);
    });

    test('test the node tree serialize & deserialize', function() {
        var rootNode = createNode('rootNode');
        var child1 = createNode('child1');
        var child2 = createNode('child2');
        var child11 = createNode('child11');
        var child12 = createNode('child12');
        var child13 = createNode('child13');

        rootNode.addChild(child1);
        rootNode.addChild(child2);
        child1.addChild(child11);
        child1.addChild(child12);
        child1.addChild(child13);

        var json = Editor.serialize(rootNode);
        var newNode = cc.deserialize(json);
        compare2Nodes(rootNode, newNode);
    });
}
