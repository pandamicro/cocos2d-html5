require('./utils');
require('./types');
require('./native');

// require engine
var EngineWrapper = require('./engine');

// register engine wrapper
Fire.Runtime.registerEngine( new EngineWrapper(false) );

// register node type
var types = [
    [cc,   'Node',           require('./node'),         'Node'],
    [cc,   'Scene',          require('./scene')],
    //[cc, 'LoaderScene',  require('./scene')],
    [cc,   'Sprite',         require('./sprite'),       'Sprite'],
    [cc,   'SpriteBatchNode',require('./sprite-batch-node'), 'SpriteBatchNode'],
    [cc,   'LabelBMFont',    require('./bitmap-font'),  'LabelBMFont'],
    [cc,   'LabelTTF',       require('./label-ttf'),    'LabelTTF'],
    [cc,   'ParticleSystem', require('./particle'),     'ParticleSystem'],
    [cc,   'ProgressTimer',  require('./progress-timer'),    'ProgressTimer'],
    [cc,   'TMXTiledMap',    require('./tiled-map')],
    [cc,   'Layer',          require('./layer'),         'Layer'],
    [cc,   'LayerColor',     require('./layer-color'),   'LayerColor'],
    [cc,   'DrawNode',       require('./draw-node'),     'DrawNode'],

    [ccui, 'Button',         require('./ui/button'),       'UI/Button'],
    [ccui, 'ImageView',      require('./ui/scale9-sprite'),'UI/Scale9Sprite'],
    [ccui, 'CheckBox',       require('./ui/check-box'),    'UI/CheckBox'],
    [ccui, 'LoadingBar',     require('./ui/loading-bar'),  'UI/LoadingBar'],
    [ccui, 'Slider',         require('./ui/slider'),       'UI/Slider'],
    [ccui, 'ScrollView',     require('./ui/scroll-view'),  'UI/ScrollView'],
    [ccui, 'ListView',       require('./ui/list-view'),    'UI/ListView'],
    [ccui, 'PageView',       require('./ui/page-view'),    'UI/PageView'],
    [ccui, 'Layout',         require('./ui/layout'),       'UI/Layout'],
    [ccui, 'Text',           require('./ui/text'),         'UI/Text'],
    [ccui, 'TextField',      require('./ui/text-field'),   'UI/TextField'],
    [ccui, 'TextAtlas',      require('./ui/text-atlas'),   'UI/TextAtlas'],
    [ccui, 'TextBMFont',     require('./ui/text-bitmap-font'),    'UI/TextBMFont'],
];



types.forEach(function (type) {
    registerCCNodeType( type[0], type[1], type[2], type[3] );
});


function registerCCNodeType (namespace, name, wrapper, menuPath) {
    var nodeType = namespace[name];

    var originCtor = nodeType.prototype.ctor;
    nodeType.prototype.ctor = function () {
        originCtor.apply(this, arguments);
        this._FB_wrapper = null;
    }

    Fire.Runtime.registerNodeType(nodeType, wrapper, menuPath);

    namespace[name] = nodeType;
}
