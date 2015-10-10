require('../src');
require('./lib/init');

var DebugPage = 0;
var PageLevel = true;
var CoreLevel = false;
if (CoreLevel) {
    // make runtime available in core-level, but Fire.engine will be undefined.
    Fire.Runtime = require('../src/runtime');
}

describe('Editor.setDeepPropertyByPath', function() {
    var spawnRunner = require('./lib/spawn-runner');
    if (!spawnRunner(this, __filename, DebugPage, PageLevel, CoreLevel)) {
        return;
    }

    it("should set property if path not contains '.'", function() {
        var target = {
            height: 1,
            position: cc.v2(123, 456),
            foo: {
                bar: cc.fireColor(0.5, 0.5, 0.5, 0.5),
            }
        };
        Editor.setDeepPropertyByPath(target, 'height', 10);
        expect(target.height).to.be.equal(10);
    });

    describe("Testing if path contains one '.'", function () {
        var target = {
            height: 1,
            position: cc.v2(123, 456),
            foo: {
                bar: cc.fireColor(0.5, 0.5, 0.5, 0.5),
            }
        };
        var originPos = target.position;
        Editor.setDeepPropertyByPath(target, 'position.x', 10);

        it("should set sub property", function() {
            expect(target.position.x).to.be.equal(10);
        });
        it("should not change other property", function() {
            expect(target.position.y).to.be.equal(456);
        });
        it("should not change the reference of main property", function() {
            expect(target.position).to.be.equal(originPos);
        });
        it("should invoke getset", function() {
            var scale = new cc.v2(1, 1);
            cc.js.getset(target, 'scale', function () {
                return new cc.v2(scale.x, scale.y);
            }, function (value) {
                scale = value;
            });
            Editor.setDeepPropertyByPath(target, 'scale.x', 10);
            expect(target.scale.x).to.be.equal(10);
        });
    });

    describe("Testing if path contains more '.'", function () {
        var target = {
            height: 1,
            position: cc.v2(123, 456),
            foo: {
                bar: cc.fireColor(0.5, 0.5, 0.5, 0.5),
            }
        };
        var originFoo = target.foo;
        Editor.setDeepPropertyByPath(target, 'foo.bar.r', 1);

        it("should set sub property", function() {
            expect(target.foo.bar.r).to.be.equal(1);
        });
        it("should not change other property", function() {
            expect(target.foo.bar).to.be.deep.equal(cc.fireColor(1, 0.5, 0.5, 0.5));
        });
        it("should not change the reference of main property", function() {
            expect(target.foo).to.be.equal(originFoo);
        });
    });

    describe('Testing if property is primitive object with multi-key', function () {
        it("should set property deeply if path not contains '.'", function() {
            var target = {
                height: 1,
                position: cc.v2(123, 456),
                foo: {
                    bar: cc.fireColor(0.5, 0.5, 0.5, 0.5),
                }
            };
            Editor.setDeepPropertyByPath(target, 'position', {x: 10, y: 20});
            expect(target.position).to.be.an.instanceof(cc.Vec2);
            expect(target.position.x).to.be.equal(10);
            expect(target.position.y).to.be.equal(20);
        });

        describe("Testing if path contains one '.'", function () {
            var target = {
                height: 1,
                position: cc.v2(123, 456),
                foo: {
                    bar: cc.fireColor(0.5, 0.5, 0.5, 0.5),
                }
            };
            var originColor = target.foo.bar;

            Editor.setDeepPropertyByPath(target, 'foo.bar', {r: 0, g:0, b:0, a:1});

            it("should set sub property deeply", function() {
                expect(target.foo.bar).to.be.deep.equal(cc.fireColor(0, 0, 0, 1));
            });
            it("should not change the reference of parent property", function() {
                expect(target.foo.bar).to.be.equal(originColor);
            });
        });

        describe("Testing if path contains more '.'", function () {
            var target = {
                height: 1,
                position: cc.v2(123, 456),
                foo: {
                    bar: cc.fireColor(0.5, 0.5, 0.5, 0.5),
                    bar2: {
                        baz: cc.fireColor(0.1, 0.2, 0.3, 0.4)
                    }
                }
            };
            var originColor = target.foo.bar2.baz;
            Editor.setDeepPropertyByPath(target, 'foo.bar2.baz', {r: 0, g:0, b:0, a:1});

            it("should set sub property", function() {
                expect(target.foo.bar2.baz).to.be.deep.equal(cc.fireColor(0, 0, 0, 1));
            });
            it("should not change the reference of main property", function() {
                expect(target.foo.bar2.baz).to.be.equal(originColor);
            });
        });
    });

    describe("Asset property", function () {
        var Target = cc.FireClass({
            properties: {
                textureUrl: {
                    default: '',
                    url: Fire.RawTexture
                },
                textureAsset: {
                    default: null,
                    type: Fire.Texture
                }
            }
        });
        var target = new Target();
        var obj = {
            target: target,
            foo: 'bar'
        };

        var DummyUuid = '54646542313';

        it("could be set if defined as url", function (done) {
            var loadAsset = sinon.stub(cc.AssetLibrary, "_queryAssetInfoInEditor", function (uuid, callback) {
                var url = 'fire://foo/bar.png';
                callback(null, url, true, Fire.RawTexture);

                expect(target.textureUrl).to.be.equal(url);

                done();
            }).withArgs(DummyUuid);

            Editor.setDeepPropertyByPath(target, 'textureUrl', {
                uuid: DummyUuid
            }, cc.js.getClassName(Fire.RawTexture));

            cc.AssetLibrary._queryAssetInfoInEditor.restore();
        });

        it("could be cleared if defined as url", function () {
            target.textureUrl = "foo.png";

            Editor.setDeepPropertyByPath(target, 'textureUrl', { uuid: "" }, cc.js.getClassName(Fire.RawTexture));

            expect(target.textureUrl).to.be.equal(null);
        });

        it("could be changed if defined as type", function (done) {
            var loadAsset = sinon.stub(cc.AssetLibrary, "loadAsset", function (uuid, callback) {
                var texture = new Fire.Texture();
                callback(null, texture);

                expect(target.textureAsset).to.be.equal(texture);

                done();
            }).withArgs(DummyUuid);

            Editor.setDeepPropertyByPath(target, 'textureAsset', {
                uuid: DummyUuid
            }, cc.js.getClassName(Fire.Texture));

            cc.AssetLibrary.loadAsset.restore();
        });

        //Editor.setDeepPropertyByPath(obj, 'target.textureUrl', '54646542313', cc.js.getClassName(Fire.Texture));
    });

    describe("Array", function () {
        var fireObj = new (cc.FireClass({
            properties: {
                indices: {
                    default: [],
                    type: Fire.Float
                },
            }
        }))();

        it("should set default value for new elements", function() {
            fireObj.indices = [1];
            Editor.setDeepPropertyByPath(fireObj, 'indices.length', 2);
            expect(fireObj.indices).to.be.deep.equal([1, 0]);
        });

        it("should set default value for new elements if is embedded", function() {
            var target = {
                foo: fireObj
            };
            fireObj.indices = [1];
            Editor.setDeepPropertyByPath(target, 'foo.indices.length', 2);
            expect(fireObj.indices).to.be.deep.equal([1, 0]);
        });

        describe('Editor.fillDefaultValue', function () {
            function test (type, expectVal) {
                var obj = new (cc.FireClass({
                    properties: {
                        prop: {
                            default: [],
                            type: type
                        },
                    }
                }))();
                var attr = cc.FireClass.attr(obj, 'prop');
                obj.prop.length = 4;
                Editor.fillDefaultValue(attr, obj.prop, 1, 3);

                it("should work if is " + (expectVal === '' ? '""' : expectVal) + " (" + attr.type + ')', function() {
                    expect(obj.prop).to.be.deep.equal([, expectVal, expectVal, ]);
                    if (expectVal && typeof expectVal === 'object') {
                        expect(obj.prop[1]).to.be.not.equal(obj.prop[2], "should create individual object if default value is object");
                    }
                });
            }
            test(Fire.Float, 0);
            test(Fire.Integer, 0);
            test('Boolean', false);
            test('String', "");
            test(cc.Enum({
                foo: 1,
                bar: 2
            }), 1);
            test(cc.Vec2, new cc.Vec2());
            test(cc.Asset, null);
        });
    });

    describe('Testing if property is typed object', function () {

        it("should set property deeply if path not contains '.'", function() {
            var target = {
                value: null
            };
            var value = new cc.Object();
            Editor.setDeepPropertyByPath(target, 'value', value, cc.js.getClassName(value));
            expect(target.value).to.be.equal(value);
        });

        it("should set property deeply if path contains one '.'", function () {
            var target = {
                foo: {
                    bar: null
                }
            };
            var value = new cc.Object();
            Editor.setDeepPropertyByPath(target, 'foo.bar', value, cc.js.getClassName(value));
            expect(target.foo.bar).to.be.equal(value);
        });
    });
});
