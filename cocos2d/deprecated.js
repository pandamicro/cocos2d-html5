var js = cc.js;

var INFO = '"%s" is deprecated, use "%s" instead please.';

js.get(cc, "inject", function () {
    cc.warn(INFO, 'cc.inject', 'cc.js.mixin');
    return js.mixin;
});

function deprecateEnum (obj, oldPath, newPath, hasTypePrefixBefore) {
    hasTypePrefixBefore = hasTypePrefixBefore !== false;
    var enumDef = eval(newPath);
    var entries = cc.Enum.getList(enumDef);
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i].name;
        var oldPropName;
        if (hasTypePrefixBefore) {
            var oldTypeName = oldPath.split('.').slice(-1)[0];
            oldPropName = oldTypeName + '_' + entry;
        }
        else {
            oldPropName = entry;
        }
        js.get(obj, oldPropName, function (entry) {
            cc.warn(INFO, oldPath + '_' + entry, newPath + '.' + entry);
            return enumDef[entry];
        }.bind(null, entry));
    }
}

deprecateEnum(cc, 'cc.TEXT_ALIGNMENT', 'cc.TextAlignment');
deprecateEnum(cc, 'cc.VERTICAL_TEXT_ALIGNMENT', 'cc.VerticalTextAlignment');
deprecateEnum(cc.ParticleSystem, 'cc.ParticleSystem.TYPE', 'cc.ParticleSystem.Type');
deprecateEnum(cc.ParticleSystem, 'cc.ParticleSystem.MODE', 'cc.ParticleSystem.Mode');
deprecateEnum(ccui.ScrollView, 'ccui.ScrollView.DIR', 'ccui.ScrollView.Dir');
deprecateEnum(ccui.Layout, 'ccui.Layout', 'ccui.Layout.LayoutType', false);
deprecateEnum(ccui.LoadingBar, 'ccui.LoadingBar.TYPE', 'ccui.LoadingBar.Type');
deprecateEnum(ccui.RelativeLayoutParameter, 'ccui.RelativeLayoutParameter', 'ccui.RelativeLayoutParameter.Type', false);
deprecateEnum(cc.ProgressTimer, 'cc.ProgressTimer.TYPE', 'cc.ProgressTimer.Type');
