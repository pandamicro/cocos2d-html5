(function () {

    var currentScene;

    var MyNode,
        MyNodeWrapper,
        MyScene,
        MySceneWrapper;
    var SpriteNeedsDeferredLoad,
        TextureNeedsDeferredLoad;
    var ScriptToMix;

    function defineTypes () {
        MyNode = cc.Class({
            ctor: function () {
                this.children = [];
                this.parent = null;
                this.color = {a:100, r:200 ,g:10, b:0};
                this.asset = arguments[0];
            }
        });
        MyNodeWrapper = cc.Class({
            name: 'MyNodeWrapper',
            extends: cc.Runtime.NodeWrapper,
            properties: {
                childrenN: {
                    get: function () {
                        return this.targetN.children;
                    }
                },
                parentN: {
                    get: function () {
                        return this.targetN.parent;
                    },
                    set: function (value) {
                        if (this.targetN.parent) {
                            cc.js.array.remove(this.targetN.parent.children, this.targetN);
                        }
                        this.targetN.parent = value;
                        value.children.push(this.targetN);
                    }
                },
                _color: {
                    default: {}
                },
                _asset: null
            },
            onBeforeSerialize: function () {
                this._color = this.targetN.color;
                this._asset = this.targetN.asset;
            },
            createNode: function () {
                var node = new MyNode(this._asset);
                node.color = this._color;
                return node;
            }
        });

        MyScene = cc.Class({
            extends: MyNode
        });
        MySceneWrapper = cc.Class({
            name: 'MySceneWrapper',
            extends: cc.Runtime.SceneWrapper,
            properties: {
                childrenN: {
                    get: function () {
                        return this.targetN.children;
                    }
                }
            },
            createNode: function () {
                var node = new MyScene();
                return node;
            }
        });

        cc.Runtime.registerNodeType(MyNode, MyNodeWrapper);
        cc.Runtime.registerNodeType(MyScene, MySceneWrapper);
        currentScene = new MyScene();

        SpriteNeedsDeferredLoad = cc.Class({
            name: 'Test.SpriteNeedsDeferredLoad',
            extends: cc.Asset,
            properties: {
                pivot: {
                    default: new cc.Vec2(0.5, 0.5),
                    tooltip: 'The pivot is normalized, like a percentage.\n' +
                             '(0,0) means the bottom-left corner and (1,1) means the top-right corner.\n' +
                             'But you can use values higher than (1,1) and lower than (0,0) too.'
                },
                trimX: {
                    default: 0,
                    type: 'Integer'
                },
                trimY: {
                    default: 0,
                    type: 'Integer'
                },
                width: {
                    default: 0,
                    type: 'Integer'
                },
                height: {
                    default: 0,
                    type: 'Integer'
                },
                texture: {
                    default: null,
                    type: cc.TextureAsset,
                    visible: false
                },
                rotated: {
                    default: false,
                    visible: false
                },
                x: {
                    default: 0,
                    type: 'Integer',
                    visible: false
                },
                y: {
                    default: 0,
                    type: 'Integer',
                    visible: false
                }
            }
        });

        TextureNeedsDeferredLoad = cc.Class({
            name: 'Test.TextureNeedsDeferredLoad',
            extends: cc.Asset,
            properties: {
                image: {
                    default: null,
                    visible: false
                },
                width: {
                    default: 0,
                    type: 'Integer',
                    readonly: true
                },
                height: {
                    default: 0,
                    type: 'Integer',
                    readonly: true
                }
            }
        });

        ScriptToMix = cc.Class({
            name: '2154648724566',
            extends: cc.Class({
                extends: cc.Behavior,
                onLoad: function () {
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
            properties: {
                name: {
                    get: function () {
                        return this._name;
                    },
                    displayName: 'Name'
                },
                target: {
                    default: null,
                    type: MyNodeWrapper
                }
            },
            getName: function () {
                return this.name;
            }
        });
    }

    var originGetCurrentSceneN;

    module('test scene serialization', {
        setup: function () {
            SetupEngine.setup();
            originGetCurrentSceneN = cc.director.getRunningScene();
            cc.director.getRunningScene = function () {
                return currentScene;
            };
            defineTypes();
        },
        teardown: function () {
            cc.js.unregisterClass(MySceneWrapper, MyNodeWrapper, SpriteNeedsDeferredLoad, TextureNeedsDeferredLoad,
                ScriptToMix);
            cc.director.getRunningScene = originGetCurrentSceneN;
            SetupEngine.teardown();
        }
    });

    var libPath = assetDir + '/library/deferred-loading';

    var grossini_uuid = '748321';
    var grossiniSprite_uuid = '1232218';

    asyncTest('serialize scene', function () {
        AssetLibrary.init(libPath);
        AssetLibrary.loadAsset(grossiniSprite_uuid, function (err, asset) {
            var sprite = asset;
            var texture = sprite.texture;

            var wrapper = cc(cc.director.getRunningScene());
            var actual = Editor.serialize(wrapper, {stringify: false});
            var expect = {
                "__type__": "MySceneWrapper",
                "content": {c: [], uuid: ""}
            };
            deepEqual(actual, expect, 'serializing empty scene');

            var node1 = new MyNode();
            node1.parent = wrapper.targetN;
            node1.color = {r: 123, g: 0, b: 255, a: 255};
            node1.asset = sprite;
            wrapper.targetN.children.push(node1);

            var node2 = new MyNode();
            node2.parent = node1;
            node2.color = {r: 321, g: 250, b: 250, a: 0};
            node2.asset = texture;
            node1.children.push(node2);

            cc.mixin(node1, ScriptToMix);
            node1.onLoad();
            node1.age = 30;
            node1.target = cc(node2);

            cc(node1)._id = 'id1';
            cc(node2)._id = 'id2';
            actual = Editor.serialize(wrapper, {stringify: false});
            expect = {
                "__type__": "MySceneWrapper",
                "content": [
                    {
                        c: [
                            {
                                "c": [
                                    {
                                        "c": undefined,
                                        "m": undefined,
                                        "t": undefined,
                                        "w": {
                                            "__id__": 3
                                        }
                                    }
                                ],
                                "m": cc.js._getClassId(ScriptToMix, false),
                                "t": {
                                    "__id__": 2
                                },
                                "w": {
                                    "__id__": 1
                                }
                            }
                        ],
                        uuid: '',
                    },
                    {
                        "__type__": "MyNodeWrapper",
                        _color: node1.color,
                        _asset: {
                            __uuid__: node1.asset._uuid
                        },
                        "_id": 'id1',
                        "_name": "",
                        "_objFlags": 0,
                        _prefab: null
                    },
                    {
                        "age": 30,
                        "target": {
                            "__id__": 3
                        }
                    },
                    {
                        "__type__": "MyNodeWrapper",
                        _color: node2.color,
                        _asset: {
                            __uuid__: node2.asset._uuid
                        },
                        "_id": 'id2',
                        "_name": "",
                        "_objFlags": 0,
                        _prefab: null
                    },
                ]
            };
            deepEqual(actual, expect, 'serializing non-empty scene');

            var loaded = cc.deserialize(actual);

            loaded.preloadAssets = new Callback(function (assets, urls, callback) {
                strictEqual(assets.length, 2, 'scene wrapper should preload 2 assets');
                if (assets[0]._uuid === sprite._uuid && assets[1]._uuid === texture._uuid) {
                    ok(true, 'checking preload assets');
                }
                else {
                    var res = assets[1]._uuid === sprite._uuid && assets[0]._uuid === texture._uuid;
                    ok(res, 'checking preload assets');
                }
                callback();
            }).enable();

            loaded.create(function () {
                loaded.preloadAssets.once('should call preloadAssets');

                strictEqual(loaded.constructor, MySceneWrapper, 'loaded scene should be MySceneWrapper');
                strictEqual(loaded.childrenN.length, 1, 'loaded scene should have 1 child');
                strictEqual(loaded.parentN, null, 'loaded scene should have no parent');

                var rootNode = loaded.childrenN[0];
                strictEqual(rootNode.constructor, MyNode, 'root node should be MyNode');
                deepEqual(rootNode.color, node1.color, 'color of root node should equals to node1');
                strictEqual(rootNode.asset._uuid, sprite._uuid, 'asset of root node should equals to sprite');
                strictEqual(cc(rootNode).childrenN.length, 1, 'root node should have 1 child');
                strictEqual(cc(rootNode).parent, loaded, 'parent of root node should be scene');

                var childNode = cc(rootNode).childrenN[0];
                deepEqual(childNode.color, node2.color, 'color of child node should equals to node2');
                strictEqual(childNode.asset._uuid, texture._uuid, 'asset of child node should equals to texture');
                strictEqual(cc(childNode).childrenN.length, 0, 'child node should have no child');
                strictEqual(cc(childNode).parentN, rootNode, 'parent of child node should be root node');

                strictEqual(rootNode.asset.texture, childNode.asset, 'references of the same asset should be equal');

                // TEST MIXIN

                strictEqual(rootNode.getName, ScriptToMix.prototype.getName, 'should mixin methods');
                strictEqual(rootNode.age, 30, 'should deserialize mixin');
                //ok(rootNode.target === childNode, 'should restore node references in mixin');
                ok(rootNode.target === cc(childNode), 'should restore wrapper references in mixin');

                start();
            });
        });
    });

})();
