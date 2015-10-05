// jshint ignore: start

module('getClassName');

test('test', function() {
    var Asset = function () {};
    cc.JS.setClassName('Asset', Asset);

    var MyAsset = (function () {
        var _super = Asset;

        function MyAsset () {
            _super.call(this);
        }
        cc.JS.extend(MyAsset, _super);
        cc.JS.setClassName('Foo', MyAsset);

        return MyAsset;
    })();
    var myAsset = new MyAsset();

    equal(cc.JS.getClassName(myAsset), 'Foo', 'can getClassName of user type');

    delete MyAsset.prototype.__classname__;  // hack, remove class name
    ok(cc.JS.getClassName(myAsset), 'should fallback to constructor name if classname undefined');
    // (constructor's name may renamed by uglify, so we do not test the value exactly)

    var asset = new Asset();
    notEqual(cc.JS.getClassName(myAsset), cc.JS.getClassName(asset), 'class name should not achieved from its super');

    cc.JS.unregisterClass(Asset, MyAsset);

    equal(cc.JS.getClassName(function () {}), '', 'class name should be "" if undefined');
});

// jshint ignore: end
