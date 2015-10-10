var Fs = require('fire-fs');
var Path = require('fire-path');
var Plist = require('plist');


var $super = Editor.metas.asset;

function SpriteAtlasMeta () {
    $super.call(this);
}

SpriteAtlasMeta.validate = function ( assetpath ) {

    var dictionary = Plist.parse( Fs.readFileSync(assetpath, 'utf8') );

    var format1 = typeof dictionary.frames !== 'undefined' && typeof dictionary.texture !== 'undefined';
    var format2 = typeof dictionary.frames !== 'undefined' && typeof dictionary.metadata !== 'undefined';
    var format3 = typeof dictionary.frames !== 'undefined' && typeof dictionary.meta !== 'undefined';

    return format1 || format2 || format3;
};

Editor.JS.extend(SpriteAtlasMeta, $super);

SpriteAtlasMeta.prototype.export = null;

module.exports = SpriteAtlasMeta;

