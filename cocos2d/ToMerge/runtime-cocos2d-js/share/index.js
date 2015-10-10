// asset
if ( Editor.isCoreLevel || Editor.isRuntime ) {
    require('./asset/index');
}

// meta and meta inspector
[
    'particle',
    'sprite-animation',
    'sprite-atlas',
    'tiled-map'
].forEach( function ( name ) {

    if ( !Editor.isRuntime ) {
        // meta
        Editor.metas[name] = require('./meta/' + name);
        Editor.metas[name]['asset-type'] = name;
        Editor.metas[name]['asset-icon'] = 'app://runtime/runtime-cocos2d-js/static/icon/' + name + '.png';

        // inspector
        if ( Editor.isPageLevel ) {
            Editor.inspectors[name] = 'app://runtime/runtime-cocos2d-js/share/inspector/' + name + '.html';
        }
    }

});

//
if ( !Editor.isRuntime ) {
    if ( Editor.isPageLevel ) {
        // register inspector
        Editor.inspectors['Runtime.NodeWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/node.html';
        Editor.inspectors['Runtime.SpriteWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/sprite-node.html';
        Editor.inspectors['Runtime.SpriteBatchNodeWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/sprite-batch-node.html';
        Editor.inspectors['Runtime.BitmapFontWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/bitmap-font-node.html';
        Editor.inspectors['Runtime.ButtonWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/button-node.html';
        Editor.inspectors['Runtime.ParticleWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/particle-node.html';
        Editor.inspectors['Runtime.ProgressTimerWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/progress-timer-node.html';
        Editor.inspectors['Runtime.LabelTTFWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/label-ttf-node.html';
        Editor.inspectors['Runtime.TiledMapWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/tiled-map-node.html';
        Editor.inspectors['Runtime.LayerWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/layer-node.html';
        Editor.inspectors['Runtime.LayerColorWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/layer-color-node.html';
        Editor.inspectors['Runtime.DrawNodeWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/draw-node.html';
        Editor.inspectors['Runtime.Scale9SpriteWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/scale9-sprite-node.html';
        Editor.inspectors['Runtime.ScrollViewWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/scroll-view-node.html';
        Editor.inspectors['Runtime.LayoutWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/layout-node.html';
        Editor.inspectors['Runtime.CheckBoxWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/check-box-node.html';
        Editor.inspectors['Runtime.LoadingBarWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/loading-bar-node.html';
        Editor.inspectors['Runtime.SliderWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/slider-node.html';
        Editor.inspectors['Runtime.PageViewWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/page-view-node.html';
        Editor.inspectors['Runtime.ListViewWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/list-view-node.html';
        Editor.inspectors['Runtime.TextWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/text-node.html';
        Editor.inspectors['Runtime.TextBMFontWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/text-bitmap-font-node.html';
        Editor.inspectors['Runtime.TextFieldWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/text-field-node.html';
        Editor.inspectors['Runtime.TextAtlasWrapper'] = 'app://runtime/runtime-cocos2d-js/share/inspector/text-atlas-node.html';

        // register property
        Editor.properties['Runtime.ParticleAsset'] = function ( fieldEL, info ) {
            return Editor.bindAsset( fieldEL, info.value, info.attrs, 'particle' );
        };

        // register property
        Editor.properties['Runtime.SpriteAnimationAsset'] = function ( fieldEL, info ) {
            return Editor.bindAsset( fieldEL, info.value, info.attrs, 'sprite-animation' );
        };

        // register property
        Editor.properties['Runtime.SpriteAtlas'] = function ( fieldEL, info ) {
            return Editor.bindAsset( fieldEL, info.value, info.attrs, 'sprite-atlas' );
        };

        // register property
        Editor.properties['Runtime.TiledMapAsset'] = function ( fieldEL, info ) {
            return Editor.bindAsset( fieldEL, info.value, info.attrs, 'tiled-map' );
        };
    }
}
