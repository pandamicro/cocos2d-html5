
/**
 * This module provides interfaces for runtime implementation.
 * @module Fire.Runtime
 * @main
 */

var Runtime = {};

var register = require('./register');
var NodeWrapper = require('./wrappers/node');

cc.js.mixin(Runtime, {
    NodeWrapper: NodeWrapper,
    SceneWrapper: require('./wrappers/scene'),
    registerNodeType: register.registerNodeType,

    registerMixin: register.registerMixin,

    EngineWrapper: require('./wrappers/engine'),
    registerEngine: register.registerEngine,

    Helpers: require('./helpers')
});

// load utility methods
require('./extends/node-extends');
require('./extends/scene-extends');
require('./extends/engine-extends');

// register a default mixin solution
require('./behavior');
var mixin = require('./mixin');
register.registerMixin(mixin);

// settings for editor
Runtime.Settings = require('./settings');

/**
 * @module Fire
 */

Fire.getWrapperType = register.getWrapperType;
Fire.menuToWrapper = register.menuToWrapper;

var mixin = register.getMixinOptions();
Fire.mixin = mixin.mixin;
Fire.hasMixin = mixin.hasMixin;
Fire.unMixin = mixin.unMixin;

Fire.find = require('./find');



module.exports = Runtime;
