require('../src');
require('./lib/init');

//// make runtime available in core-level
//cc.Runtime = require('../src/runtime');

var DebugPage = 0;
var PageLevel = true;
var CoreLevel = false;

describe('Runtime helpers', function () {
    var spawnRunner = require('./lib/spawn-runner');
    if (!spawnRunner(this, __filename, DebugPage, PageLevel, CoreLevel)) {
        return;
    }

    var Helpers = cc.Runtime.Helpers;

    before(function () {
        Helpers.init();
    });

    after(function () {
        cc.engine.off('post-update', Helpers._debounceNodeEvent);
    });

    it('should emit "node-attach-to-scene"', function () {
        var c1 = new TestNode();

        var target;
        cc.engine.once("node-attach-to-scene", function (event) {
            target = event.detail.targetN;
        });
        Helpers.onNodeAttachedToParent(c1);

        expect(target).to.be.equals(c1);
    });

    it('should emit "node-detach-from-scene" in next frame', function () {
        var c1 = new TestNode();

        var target;
        cc.engine.once("node-detach-from-scene", function (event) {
            target = event.detail.targetN;
        });
        Helpers.onNodeDetachedFromParent(c1);

        cc.engine.emit("post-update");

        expect(target).to.be.equals(c1);
    });

    it('should maintains attached node', function () {
        var c1 = new TestNode();

        Helpers.onNodeAttachedToParent(c1);
        expect(cc.engine.attachedWrappersForEditor[cc(c1).uuid]).to.be.equals(cc(c1));

        Helpers.onNodeDetachedFromParent(c1);
        cc.engine.emit("post-update");
        expect(cc.engine.attachedWrappersForEditor[cc(c1).uuid]).to.be.undefined;
    });

    it('should debounce event in one frame', function () {
        var c1 = new TestNode();
        var c2 = new TestNode();

        var target = [];
        cc.engine.once("node-detach-from-scene", function (event) {
            target.push(event.detail.targetN);
        });

        cc.engine.attachedWrappersForEditor[cc(c1).uuid] = 'unchanged';

        Helpers.onNodeDetachedFromParent(c1);
        Helpers.onNodeDetachedFromParent(c2);
        Helpers.onNodeAttachedToParent(c1);

        cc.engine.emit("post-update");

        expect(target).to.be.deep.equals([c2]);
        expect(cc.engine.attachedWrappersForEditor[cc(c1).uuid]).to.be.equals('unchanged');
        expect(cc.engine.attachedWrappersForEditor[cc(c2).uuid]).to.be.undefined;
    });
});
