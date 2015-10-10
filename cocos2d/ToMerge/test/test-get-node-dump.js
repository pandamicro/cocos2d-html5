require('../src');
require('./lib/init');

var DebugPage = 0;
var PageLevel = true;
var CoreLevel = false;
if (CoreLevel) {
    // make runtime available in core-level, but Fire.engine will be undefined.
    Fire.Runtime = require('../src/runtime');
}

describe('Editor.getNodeDump (test-get-node-dump.js)', function () {
    var spawnRunner = require('./lib/spawn-runner');
    if (!spawnRunner(this, __filename, DebugPage, PageLevel, CoreLevel)) {
        return;
    }

    function test (debug, object, expectedDump) {
        if (debug !== true) {
            expectedDump = object;
            object = debug;
            debug = false;
        }
        var dump = Editor.getNodeDump(object);
        if (debug) {
            console.log('\nTypes: ' + JSON.stringify(dump.types, null, 4));
            expect(dump.types).to.deep.equal(expectedDump.types);
            console.log('\nValue: ' + JSON.stringify(dump.value, null, 4));
            expect(dump.value).to.deep.equal(expectedDump.value);
        }
        else {
            expect(dump).to.deep.equal(expectedDump);
        }
    }

    var node, Node, NodeWrapper, Script;

    before(function () {
        Node = function () {};
        Node.prototype.getAge = function () {};

        NodeWrapper = cc.FireClass({
            name: 'MyNodeWrapper',
            extends: Fire.Runtime.NodeWrapper,
            properties: {
                parentN: {
                    get: function () {
                        return null;
                    }
                },
                childrenN: {
                    get: function () {
                        return [];
                    }
                },
                position: {
                    get: function () {
                        return cc.v2(123, 456);
                    }
                },
                worldPosition: {
                    get: function () {
                        return cc.Vec2.zero;
                    }
                },
                rotation: {
                    get: function () {
                        return 0;
                    }
                },
                worldRotation: {
                    get: function () {
                        return 0;
                    }
                },
                scale: {
                    get: function () {
                        return cc.Vec2.one;
                    }
                },
                worldScale: {
                    get: function () {
                        return cc.Vec2.one;
                    }
                }
            }
        });
        Fire.Runtime.registerNodeType(Node, NodeWrapper);

        node = new Node();

        var FilterMode = cc.Enum({
            Point: -1,
            Bilinear: -1,
            Trilinear: -1
        });

        Script = cc.FireClass({
            name: '2154648724566',
            extends: cc.FireClass({
                extends: Fire.Behavior,
                constructor: function () {
                    this.realAge = 30;
                },
                properties: {
                    age: {
                        default: 40,
                        tooltip: 'Age'
                    }
                },
                getAge: function () {
                    return this.age;
                }
            }),
            init: function () {
                this._name = 'ha';
            },
            properties: {
                name: {
                    get: function () {
                        return this._name;
                    },
                    displayName: 'Name'
                },
                wrapMode: {
                    default: FilterMode.Bilinear,
                    type: FilterMode
                },
                texture: {
                    default: null,
                    type: Fire.Texture
                },
                indices: {
                    default: [],
                    type: Fire.Integer
                }
            },
            getName: function () {
                return this.name;
            }
        });

        Fire.mixin(node, Script);
        node.init();
        node.indices = [2, 1];
    });
    after(function () {
        cc.js.unregisterClass(Script, NodeWrapper);
    });

    describe('dump result', function () {

        var dump;
        before(function () {
            // test wrong type
            node.texture = new Fire.Sprite();
            node.texture._uuid = '43728e743120';
            //
            dump = Editor.getNodeDump(node);
        });

        it('should contain types', function () {
            //console.log(JSON.stringify(dump.types, null, 4));
            expect(dump.types).to.deep.equal({
                'MyNodeWrapper': {
                    extends: ['Fire.Runtime.NodeWrapper', 'cc.Object'],
                    properties: {
                        _name: {
                            visible: false
                        },
                        _objFlags: {
                            visible: false
                        },
                        _prefab: {
                            default: null,
                            visible: false
                        },
                        _id: {
                            default: "",
                            visible: false,
                        },
                        childrenN: {
                            visible: false
                        },
                        uuid: {
                            visible: false
                        },
                        name: {},
                        parentN: {
                            visible: false
                        },
                        position: {},
                        root: {},
                        rotation: {
                            tooltip: "The clockwise degrees of rotation relative to the parent"
                        },
                        scale: {},
                        scaleX: {
                            visible: false
                        },
                        scaleY: {
                            visible: false
                        },
                        worldPosition: {
                            visible: false
                        },
                        worldRotation: {
                            visible: false
                        },
                        worldScale: {
                            visible: false
                        },
                        worldX: {
                            visible: false
                        },
                        worldY: {
                            visible: false
                        },
                        x: {
                            visible: false
                        },
                        y: {
                            visible: false
                        },
                    }
                },
                '2154648724566': {
                    extends: [ cc.js._getClassId(Script.$super), 'Fire.Behavior' ],
                    properties: {
                        age: {
                            default: 40,
                            tooltip: 'Age'
                        },
                        name: {
                            displayName: 'Name'
                        },
                        "wrapMode": {
                            "default": 1,
                            "type": "Enum",
                            "enumList": [
                                {
                                    "name": "Point",
                                    "value": 0
                                },
                                {
                                    "name": "Bilinear",
                                    "value": 1
                                },
                                {
                                    "name": "Trilinear",
                                    "value": 2
                                }
                            ]
                        },
                        texture: {
                            default: null,
                            type: 'Fire.Texture',
                        },
                        indices: {
                            default: [],
                            type: 'Integer',
                        }
                    }
                },
                'Fire.Texture': {
                    extends: [ 'cc.Asset', 'cc.RawAsset', 'cc.Object' ],
                },
                'cc.Vec2': {
                    extends: [ 'cc.ValueType' ],
                },
                'Fire.Sprite': {
                    extends: [ 'cc.Asset', 'cc.RawAsset', 'cc.Object' ],
                }
            });
        });
        it('should contain value', function () {
            //console.log(JSON.stringify(dump.value, null, 4));
            expect(dump.value).to.deep.equal({
                __type__: 'MyNodeWrapper',
                _name: '',
                name: '',
                _objFlags: 0,
                _prefab: null,
                _id: cc(node)._id,
                uuid: cc(node).uuid,
                childrenN: [],
                parentN: null,
                position: {
                    __type__: 'cc.Vec2',
                    x: 123,
                    y: 456
                },
                rotation: 0,
                scale: {
                    __type__: 'cc.Vec2',
                    x: 1,
                    y: 1
                },
                scaleX: 1,
                scaleY: 1,
                worldPosition: {
                    __type__: 'cc.Vec2',
                    x: 0,
                    y: 0
                },
                worldRotation: 0,
                worldScale: {
                    __type__: 'cc.Vec2',
                    x: 1,
                    y: 1
                },
                worldX: 0,
                worldY: 0,
                x: 123,
                y: 456,
                root: {
                    __type__: "MyNodeWrapper",
                    uuid: cc(node).root.uuid,
                    name: cc(node).root.name
                },

                __mixins__: [{
                    __type__: '2154648724566',
                    age: 40,
                    name: 'ha',
                    wrapMode: 1,
                    texture: {
                        __type__: 'Fire.Sprite',
                        uuid: node.texture._uuid
                    },
                    indices: [2, 1]
                }]
            });
        });
    });
    describe('getInheritanceChain', function () {
        it('should return empty array if is anonymous function', function () {
            function Node () {}
            var actual = Editor.getNodeDump.getInheritanceChain(Node);
            expect(actual).to.deep.equal([]);
        });
        it('should return empty array if is anonymous fire class', function () {
            var Node = cc.FireClass();
            var actual = Editor.getNodeDump.getInheritanceChain(Node);
            expect(actual).to.deep.equal([]);
        });
        it('should not contain self class', function () {
            var Sprite = cc.FireClass({
                name: 'Sprite'
            });
            var actual = Editor.getNodeDump.getInheritanceChain(Sprite);
            expect(actual).to.deep.equal([]);
            cc.js.unregisterClass(Sprite);
        });
        it('should ignore anonymous type', function () {
            var Obj = cc.FireClass({
                name: 'Object',
            });
            var HashObj = cc.FireClass({
                extends: Obj
            });
            var Node = cc.FireClass({
                name: 'Node',
                extends: HashObj
            });
            var Sprite = cc.FireClass({
                name: 'Sprite',
                extends: Node
            });
            cc.js._setClassId('', HashObj);
            var actual = Editor.getNodeDump.getInheritanceChain(Sprite);
            expect(actual).to.deep.equal(['Node', 'Object']);
            cc.js.unregisterClass(Sprite, Node, Obj);
        });
        it('should traversal primitive inheritance chain', function () {
            function Obj () {}
            cc.js.setClassName('Object', Obj);
            function HashObj () {}
            cc.js.extend(HashObj, Obj);
            cc.js.setClassName('HashObject', HashObj);
            var Node = cc.FireClass({
                name: 'Node',
                extends: HashObj
            });
            var Sprite = cc.FireClass({
                name: 'Sprite',
                extends: Node
            });
            var actual = Editor.getNodeDump.getInheritanceChain(Sprite);
            expect(actual).to.deep.equal(['Node', 'HashObject', 'Object']);
            cc.js.unregisterClass(Sprite, Node, HashObj, Obj);
        });
    });
    describe('url', function () {
        it('should be dumped', function () {
            var node = new Node();
            var Script = cc.FireClass({
                name: 'MyScript',
                extends: Fire.Behavior,
                properties: {
                    texture: {
                        default: '',
                        url: Fire.RawTexture
                    },
                    textureList: {
                        default: [],
                        url: [Fire.RawTexture]
                    },
                    texture_nullValue: {
                        default: null,
                        url: Fire.RawTexture
                    }
                }
            });

            Fire.mixin(node, Script);
            node.texture = 'foo/bar.png';
            node.textureList = ['foo/bar.png'];
            node.texture_nullValue = null;
            var urlToUuid = sinon.stub(Editor, "urlToUuid");
            urlToUuid.returns('543875034502');
            test(node, {
                types: {
                    "MyNodeWrapper": {
                        "extends": [
                            "Fire.Runtime.NodeWrapper", "cc.Object"
                        ],
                        "properties": {
                            "_name": {
                                "visible": false
                            },
                            "_objFlags": {
                                "visible": false
                            },
                            "_prefab": {
                                "default": null,
                                "visible": false
                            },
                            "name": {},
                            "_id": {
                                "default": "",
                                "visible": false
                            },
                            "uuid": {
                                "visible": false
                            },
                            "parentN": {
                                "visible": false
                            },
                            "childrenN": {
                                "visible": false
                            },
                            "position": {},
                            "x": {
                                "visible": false
                            },
                            "y": {
                                "visible": false
                            },
                            "worldPosition": {
                                "visible": false
                            },
                            "worldX": {
                                "visible": false
                            },
                            "worldY": {
                                "visible": false
                            },
                            "rotation": {
                                "tooltip": "The clockwise degrees of rotation relative to the parent"
                            },
                            "worldRotation": {
                                "visible": false
                            },
                            "scale": {},
                            "scaleX": {
                                "visible": false
                            },
                            "scaleY": {
                                "visible": false
                            },
                            "worldScale": {
                                "visible": false
                            },
                            "root": {}
                        }
                    },
                    "MyScript": {
                        "extends": [ "Fire.Behavior" ],
                        "properties": {
                            "texture": {
                                "default": "",
                                "type": 'Fire.RawTexture'
                            },
                            "textureList": {
                                "default": [],
                                "type": 'Fire.RawTexture'
                            },
                            "texture_nullValue": {
                                "default": null,
                                "type": 'Fire.RawTexture'
                            }
                        }
                    },
                    'Fire.RawTexture': {
                        extends: [ 'cc.RawAsset', 'cc.Object' ],
                    },
                    'cc.Vec2': {
                        extends: [ 'cc.ValueType' ],
                    },
                },
                value: {
                    __type__: 'MyNodeWrapper',
                    _name: '',
                    _objFlags: 0,
                    _prefab: null,
                    name: '',
                    _id: cc(node).uuid,
                    uuid: cc(node).uuid,
                    parentN: null,
                    childrenN: [],
                    position: { __type__: 'cc.Vec2', x: 123, y: 456 },
                    x: 123,
                    y: 456,
                    worldPosition: { __type__: 'cc.Vec2', x: 0, y: 0 },
                    worldX: 0,
                    worldY: 0,
                    rotation: 0,
                    worldRotation: 0,
                    scale: { __type__: 'cc.Vec2', x: 1, y: 1 },
                    scaleX: 1,
                    scaleY: 1,
                    worldScale: { __type__: 'cc.Vec2', x: 1, y: 1 },
                    root: {
                        __type__: 'MyNodeWrapper',
                        uuid: cc(node).uuid,
                        name: cc(node).root.name
                    },
                    __mixins__: [{
                        __type__: "MyScript",
                        texture: {
                            uuid: "543875034502",
                        },
                        textureList: [{
                            uuid: "543875034502",
                        }],
                        texture_nullValue: {
                            uuid: "",
                        }
                    }]
                }
            });

            Editor.urlToUuid.restore();
            cc.js.unregisterClass(Script);
        });
    });
    describe('embedded class', function () {
        it('should be dumped', function () {
            var node = new Node();
            var FrameInfo = cc.FireClass({
                name: 'FrameInfo',
                properties: {
                    index: {
                        default: 1,
                        tooltip: 'Hey'
                    },
                    tex: {
                        default: '',
                        url: Fire.RawTexture
                    }
                }
            });
            var Script = cc.FireClass({
                name: 'MyScript',
                extends: Fire.Behavior,
                properties: {
                    frame: {
                        default: null,
                        type: FrameInfo
                    },
                }
            });

            Fire.mixin(node, Script);
            node.frame = new FrameInfo();
            node.frame.index = 321;
            node.frame.tex = 'foo/bar.png';

            var urlToUuid = sinon.stub(Editor, "urlToUuid");
            urlToUuid.returns('543875034502');
            //console.log(JSON.stringify(Editor.getNodeDump(node), null, 4));
            test(node, {
                types: {
                    "MyNodeWrapper": {
                        "extends": [
                            "Fire.Runtime.NodeWrapper", "cc.Object"
                        ],
                        "properties": {
                            "_name": {
                                "visible": false
                            },
                            "_objFlags": {
                                "visible": false
                            },
                            "_prefab": {
                                "default": null,
                                "visible": false
                            },
                            "name": {},
                            "_id": {
                                "default": "",
                                "visible": false
                            },
                            "uuid": {
                                "visible": false
                            },
                            "parentN": {
                                "visible": false
                            },
                            "childrenN": {
                                "visible": false
                            },
                            "position": {},
                            "x": {
                                "visible": false
                            },
                            "y": {
                                "visible": false
                            },
                            "worldPosition": {
                                "visible": false
                            },
                            "worldX": {
                                "visible": false
                            },
                            "worldY": {
                                "visible": false
                            },
                            "rotation": {
                                "tooltip": "The clockwise degrees of rotation relative to the parent"
                            },
                            "worldRotation": {
                                "visible": false
                            },
                            "scale": {},
                            "scaleX": {
                                "visible": false
                            },
                            "scaleY": {
                                "visible": false
                            },
                            "worldScale": {
                                "visible": false
                            },
                            "root": {}
                        }
                    },
                    'Fire.RawTexture': {
                        extends: [ 'cc.RawAsset', 'cc.Object' ],
                    },
                    'cc.Vec2': {
                        extends: [ 'cc.ValueType' ],
                    },
                    "MyScript": {
                        "extends": [ "Fire.Behavior" ],
                        "properties": {
                            "frame": {
                                "type": 'FrameInfo',
                                "default": null
                            }
                        }
                    },
                    'FrameInfo': {
                        "properties": {
                            "index": {
                                "default": 1,
                                "tooltip": 'Hey'
                            },
                            "tex": {
                                "type": 'Fire.RawTexture',
                                "default": ""
                            }
                        }
                    },
                },
                value: {
                    __type__: 'MyNodeWrapper',
                    _name: '',
                    _objFlags: 0,
                    _prefab: null,
                    name: '',
                    _id: cc(node).uuid,
                    uuid: cc(node).uuid,
                    parentN: null,
                    childrenN: [],
                    position: { __type__: 'cc.Vec2', x: 123, y: 456 },
                    x: 123,
                    y: 456,
                    worldPosition: { __type__: 'cc.Vec2', x: 0, y: 0 },
                    worldX: 0,
                    worldY: 0,
                    rotation: 0,
                    worldRotation: 0,
                    scale: { __type__: 'cc.Vec2', x: 1, y: 1 },
                    scaleX: 1,
                    scaleY: 1,
                    worldScale: { __type__: 'cc.Vec2', x: 1, y: 1 },
                    root: {
                        __type__: 'MyNodeWrapper',
                        uuid: cc(node).uuid,
                        name: cc(node).root.name
                    },
                    __mixins__: [
                        {
                            __type__: "MyScript",
                            frame: {
                                index: 321,
                                tex: {
                                    uuid: "543875034502"
                                }
                            },
                        }
                    ]
                }
            });

            Editor.urlToUuid.restore();
            cc.js.unregisterClass(Script);
        });
    });

    describe('runtime node', function () {
        it('should be dumped as wrapper', function () {
            var node = new Node();

            Fire.mixin(node, TestScript);
            node.target = node;

            test(node, {
                types: {
                    "MyNodeWrapper": {
                        "extends": [
                            "Fire.Runtime.NodeWrapper", "cc.Object"
                        ],
                        "properties": {
                            "_name": {
                                "visible": false
                            },
                            "_objFlags": {
                                "visible": false
                            },
                            "_prefab": {
                                "default": null,
                                "visible": false
                            },
                            "name": {},
                            "_id": {
                                "default": "",
                                "visible": false
                            },
                            "uuid": {
                                "visible": false
                            },
                            "parentN": {
                                "visible": false
                            },
                            "childrenN": {
                                "visible": false
                            },
                            "position": {},
                            "x": {
                                "visible": false
                            },
                            "y": {
                                "visible": false
                            },
                            "worldPosition": {
                                "visible": false
                            },
                            "worldX": {
                                "visible": false
                            },
                            "worldY": {
                                "visible": false
                            },
                            "rotation": {
                                "tooltip": "The clockwise degrees of rotation relative to the parent"
                            },
                            "worldRotation": {
                                "visible": false
                            },
                            "scale": {},
                            "scaleX": {
                                "visible": false
                            },
                            "scaleY": {
                                "visible": false
                            },
                            "worldScale": {
                                "visible": false
                            },
                            "root": {}
                        }
                    },
                    'cc.Vec2': {
                        extends: [ 'cc.ValueType' ],
                    },
                    "MyScript": {
                        "extends": [ "Fire.Behavior" ],
                        "properties": {
                            "target": {
                                "type": 'MyNodeWrapper',
                                "default": null
                            }
                        }
                    },
                },
                value: {
                    __type__: 'MyNodeWrapper',
                    _name: '',
                    _objFlags: 0,
                    _prefab: null,
                    name: '',
                    _id: cc(node).uuid,
                    uuid: cc(node).uuid,
                    parentN: null,
                    childrenN: [],
                    position: { __type__: 'cc.Vec2', x: 123, y: 456 },
                    x: 123,
                    y: 456,
                    worldPosition: { __type__: 'cc.Vec2', x: 0, y: 0 },
                    worldX: 0,
                    worldY: 0,
                    rotation: 0,
                    worldRotation: 0,
                    scale: { __type__: 'cc.Vec2', x: 1, y: 1 },
                    scaleX: 1,
                    scaleY: 1,
                    worldScale: { __type__: 'cc.Vec2', x: 1, y: 1 },
                    root: {
                        __type__: 'MyNodeWrapper',
                        uuid: cc(node).uuid,
                        name: cc(node).root.name
                    },
                    __mixins__: [
                        {
                            __type__: "MyScript",
                            target: {
                                uuid: cc(node).uuid,
                                name: cc(node).root.name
                            }
                        }
                    ]
                }
            });
        });
    });
});
