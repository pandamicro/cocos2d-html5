require('./platform');
require('./assets');

if (!CC_EDITOR || !Editor.isCoreLevel) {
    require('./CCNode');
    require('./CCScene');

    var comps = require('./components');

    // register builtin component menus
    comps.forEach(function (item) {
        cc.addComponentMenu.apply(null, item);
    });
}
