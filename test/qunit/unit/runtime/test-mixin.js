module('mixin');

test('basic', function() {
    function Node () {}
    Node.prototype.getAge = function () {};

    var NodeWrapper = cc.Class({
        extends: cc.Runtime.NodeWrapper
    });
    cc.Runtime.registerNodeType(Node, NodeWrapper);

    var originGetAge = Node.prototype.getAge;
    var node = new Node();

    var Script = cc.Class({
        name: '2154648724566',
        extends: cc.Class({
            extends: cc.Behavior,
            load: function () {
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
        ctor: function () {
            this._ctorCalled = true;
        },
        load: function () {
            this._name = 'ha';
        },
        properties: {
            name: {
                get: function () {
                    return this._name;
                },
                displayName: 'Name'
            }
        },
        getName: function () {
            return this.name;
        }
    });

    strictEqual(cc.hasMixin(node, Script), false, 'cc.hasMixin should be false before calling cc.mixin');

    cc.mixin(node, Script);

    strictEqual(cc.hasMixin(node, cc.Class()), false, 'cc.hasMixin should be false if not class Script');
    strictEqual(cc.hasMixin(node, Script), true, 'cc.hasMixin should be true if is class Script');

    strictEqual(node.constructor, Node, 'constructor should not changed');

    strictEqual(node._ctorCalled, undefined, 'should not execute constructor');
    node.load();
    strictEqual(node._name, 'ha', 'could call load');
    strictEqual(node.name, 'ha', 'should mixin properties');
    strictEqual(cc.Class.attr(node, 'name').displayName, 'Name', 'should mixin attributes');
    strictEqual(node.getName(), 'ha', 'should mixin methods');

    strictEqual(node.age, 40, 'should mixin base properties');
    strictEqual(cc.Class.attr(node, 'age').tooltip, 'Age', 'should mixin base attributes');
    notStrictEqual(node.getAge, originGetAge, 'should override origin methods');
    strictEqual(node.getAge(), 40, 'should mixin base methods');

    strictEqual(Node.__props__, undefined, 'should not change origin class');

    cc.unMixin(node, Script);
    strictEqual(cc.hasMixin(node, Script), false, 'could un-mixin');

    cc.js.unregisterClass(Script);
});

//test('inherited', function() {
//    var mixinOpt = cc.getMixinOptions();
//
//    function Node () {}
//    var node = new Node();
//
//    var Script = cc.Class({
//        ctor: function () {
//            this._name = 'ha';
//        },
//        properties: {
//            name: {
//                get: function () {
//                    return this._name;
//                },
//                displayName: 'Name'
//            }
//        },
//        getName: function () {
//            return this.name;
//        }
//    });
//
//    mixinOpt.mixin(node, Script);
//
//    strictEqual(node._name, 'ha', 'should mixin constructor');
//    strictEqual(node.name, 'ha', 'should mixin properties');
//    strictEqual(cc.Class.attr(node, 'name').displayName, 'Name', 'should mixin attributes');
//    strictEqual(node.getName(), 'ha', 'should mixin methods');
//});
