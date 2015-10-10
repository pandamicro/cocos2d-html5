var Fs = require('fire-fs');
var Path = require('fire-path');
var Plist = require('plist');


var $super = Editor.metas.asset;

function ParticleMeta () {
    $super.call(this);
}

ParticleMeta.validate = function ( assetpath ) {

    var dictionary = Plist.parse( Fs.readFileSync(assetpath, 'utf8') );

    return typeof dictionary.maxParticles !== 'undefined';
};

Editor.JS.extend(ParticleMeta, $super);

ParticleMeta.prototype.export = null;

module.exports = ParticleMeta;

