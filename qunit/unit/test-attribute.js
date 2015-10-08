module('Attribute');

test('base', function () {
    var MyCompBase = function () {
        this.baseVal = [];
    };

    cc.FireClass.attr(MyCompBase, 'baseVal', {
        data: 'waha'
    });

    strictEqual(cc.FireClass.attr(MyCompBase, 'baseVal').data, 'waha', 'can get attribute');

    cc.FireClass.attr(MyCompBase, 'baseVal').foo = { bar: 524 };
    strictEqual(cc.FireClass.attr(MyCompBase, 'baseVal').foo.bar, 524, 'can assign directly');

    var attr = cc.FireClass.attr(MyCompBase, 'baseVal', {
        cool: 'nice'
    });
    ok(attr.data && attr.cool && attr.foo, 'can merge multi attribute');

    cc.FireClass.attr(MyCompBase, 'baseVal', {
        data: false
    });
    strictEqual(attr.data, false, 'can change attribute');

    // inherit

    var MyComp1 = function () { };
    cc.js.extend(MyComp1, MyCompBase);
    var MyComp2 = function () { };
    cc.js.extend(MyComp2, MyCompBase);

    strictEqual(cc.FireClass.attr(MyComp1, 'baseVal').cool, 'nice', 'can get inherited attribute');
    cc.FireClass.attr(MyComp1, 'baseVal', {cool: 'good'});
    strictEqual(cc.FireClass.attr(MyComp1, 'baseVal').cool, 'good', 'can override inherited attribute');

    // yes, current implement of attr is not based on real javascript prototype
    strictEqual(cc.FireClass.attr(MyCompBase, 'baseVal').cool, 'good', 'Oh yes, sub prop of base class will be pulluted!');

    cc.FireClass.attr(MyComp1, 'subVal', {}).cool = 'very nice';
    strictEqual(cc.FireClass.attr(MyComp1, 'subVal').cool, 'very nice', 'can have own attribute');

    strictEqual(cc.FireClass.attr(MyCompBase, 'subVal'), undefined, 'main prop of base class not pulluted');
    strictEqual(cc.FireClass.attr(MyComp2, 'subVal'), undefined, 'sibling class not pulluted');
});

test('not object type', function () {
    var MyCompBase = function () {};
    cc.FireClass.attr(MyCompBase, 'subVal', false);
    strictEqual(cc.FireClass.attr(MyCompBase, 'subVal'), false, 'attr should set to false');
    cc.FireClass.attr(MyCompBase, 'subVal', true);
    strictEqual(cc.FireClass.attr(MyCompBase, 'subVal'), true, 'attr should set to true');
});

test('dynamic attribute for instance', function () {
    var MyCompBase = function () {};
    var comp = new MyCompBase();

    cc.FireClass.attr(MyCompBase, 'subVal', false);
    cc.FireClass.attr(comp, 'subVal', true);
    strictEqual(cc.FireClass.attr(MyCompBase, 'subVal'), false, 'class attr should set to false');
    strictEqual(cc.FireClass.attr(comp, 'subVal'), true, 'instance attr should set to true');

    cc.FireClass.attr(MyCompBase, 'baseVal', 123);
    strictEqual(cc.FireClass.attr(comp, 'baseVal'), 123, 'instance attr should inherited from base');


    cc.FireClass.attr(MyCompBase, 'readonly', {a: false});
    cc.FireClass.attr(comp, 'readonly', {b: true});
    deepEqual(cc.FireClass.attr(comp, 'readonly'), {a: false, b: true}, 'object attrs should merged');

    cc.FireClass.attr(MyCompBase, 'readonly', {b: false});
    deepEqual(cc.FireClass.attr(comp, 'readonly'), {a: false, b: true}, 'instance attr should override base');

    cc.FireClass.attr(MyCompBase, 'readonly', {b: false});
    deepEqual(cc.FireClass.attr(MyCompBase, 'readonly'), {a: false, b: false}, 'class attrs should not changed');
});
