var Fs = require('fire-fs');
var Path = require('fire-path');

var $super = Editor.metas.asset;

function TiledMapMeta () {
    $super.call(this);
}

Editor.JS.extend(TiledMapMeta, $super);

TiledMapMeta.prototype.export = null;

module.exports = TiledMapMeta;

