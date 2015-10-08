var packageJson = require('../package.json');

Runtime.init = function (assetdb) {
    var ED = global.Editor;
    if ( ED && ED.isCoreLevel ) {
        ED.versions['cocos2d-html5'] = packageJson['engine-version'];
        ED.versions['runtime-cocos2d-html5'] = packageJson['version'];

        Editor.assetdb.register( '.plist', false, Editor.metas['sprite-atlas'] );
        Editor.assetdb.register( '.plist', false, Editor.metas['particle'] );
        Editor.assetdb.register( '.animation', false, Editor.metas['sprite-animation'] );
        Editor.assetdb.register( '.tmx', false, Editor.metas['tiled-map'] );
    }
};
