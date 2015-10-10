var Fs = require('fire-fs');
var Path = require('fire-path');

var $super = Editor.metas.asset;

function SpriteAnimationMeta () {
    $super.call(this);

    for (var i = 0; i<10; i++) {
        this[i] = '';
    }

    this.loop = true;
    this.delay = 0.2;
}


Editor.JS.extend(SpriteAnimationMeta, $super);

SpriteAnimationMeta.prototype.serialize = function () {
    $super.prototype.serialize.call(this);
    return this;
};

SpriteAnimationMeta.prototype.deserialize = function ( jsonObj ) {
    $super.prototype.deserialize.call(this, jsonObj);

    for (var i = 0; i<10; i++) {
        this[i] = jsonObj[i];
    }

    this.loop = jsonObj.loop;
    this.delay = jsonObj.delay;
};

SpriteAnimationMeta.prototype.dests = function ( assetdb ) {
    return [
        assetdb._uuidToImportPathNoExt( this.uuid ) + '.json',
    ];
};

SpriteAnimationMeta.prototype.useRawfile = function () {
    return false;
};

SpriteAnimationMeta.prototype.import = function ( assetdb, fspath, cb ) {
    var basename = Path.basename(fspath);

    var asset = new Runtime.SpriteAnimationAsset();
    asset.name = Path.basenameNoExt(fspath);
    asset._setRawFiles([
        basename
    ]);

    for (var i = 0; i<10; i++) {
        asset[i] = this[i] ? Editor.assetdb.uuidToUrl(this[i]) : '';
    }

    asset.loop = this.loop;
    asset.delay = this.delay;

    var json;
    if ( asset.serialize ) {
        json = asset.serialize();
    }
    if ( !json ) {
        json = JSON.stringify( asset, null, 2 );
    }

    Fs.writeFileSync( fspath, json );
    assetdb.saveAssetToLibrary( this.uuid, asset );

    if ( cb ) cb ();
};

SpriteAnimationMeta.prototype.export = null;

module.exports = SpriteAnimationMeta;

