// hard code for browserify

require('./texture');
require('./bitmap-font');
require('./sprite-animation');
require('./particle');
require('./sprite-atlas');
require('./tiled-map');

if ( CC_EDITOR && Editor.assets ) {
    [
        'sprite-animation',
        'particle',
        'sprite-atlas',
        'tiled-map'
    ].forEach(function (typeInEditor) {
        Editor.assets[typeInEditor] = require('./' + typeInEditor);
    });
}
