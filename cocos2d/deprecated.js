var js = cc.js;

var INFO = '"%s" is deprecated, use "%s" instead please.';

js.get(cc, "inject", function () {
    cc.warn(INFO, 'cc.inject', 'cc.js.mixin');
    return js.mixin;
});
