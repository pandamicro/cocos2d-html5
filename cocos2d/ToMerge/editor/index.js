var root = typeof global !== 'undefined' ? global : window;

/**
 * Global object with classes, properties and methods you can access in fireball editor.
 *
 * @module Editor
 * @main Editor
 */

if (!root.Editor) {
    // Always export Editor globally.
    root.Editor = {};
}

// register builtin assets
Editor.assets = Editor.assets || {};
Editor.assets.asset = cc.RawAsset;    // 目前 AssetDB 的默认类型是 asset，这个类型是不 import 的，所以对应的是 cc.RawAsset
//Editor.assets.asset = cc.Asset;

//// extends engine
//require('./extends/runtime');

require('./serialize');
require('./get-node-dump');
require('./get-hierarchy-dump');
require('./set-property-by-path');
require('./utils');
require('./uuid-utils');
require('./missing-behavior');
require('./prefab-utils');

if (!CC_TEST) {
    // redirect log methods to fireball console
    cc.log = Editor.log;
    cc.info = Editor.info;
    cc.warn = Editor.warn;
    cc.error = Editor.error;
}

if (Editor.isCoreLevel) {
    // declare global variables that can be accessed remotely in page-level
    Editor.nodeCreateMenu = null;
}

module.exports = Editor;
