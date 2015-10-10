
var Utils = require('./utils');

if (cc.sys.isNative) {
    // is runtime
    cc.loader.loadJson = function (url, callback) {
        cc.loader.loadJson(url, callback);
    };

    // overide cc.log system
    var log = function () {
        var text = Utils.format.apply(this, arguments);
        console.log(text);
    };

    cc.log   = log;
    cc.error = log;
    cc.warn  = log;
    cc.info  = log;
}
