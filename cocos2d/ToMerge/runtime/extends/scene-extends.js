var JS = cc.js;
var nodeExtends = require('./node-extends');
var dumpNodeForSerialization = nodeExtends.dumpNodeForSerialization;
var initNodeAndChildren = nodeExtends.initNodeAndChildren;
var NodeWrapper = require('../wrappers/node');

/**
 * @module Fire.Runtime
 */

/**
 * @class SceneWrapper
 */
var SceneWrapper = require('../wrappers/scene');

var sceneProto = SceneWrapper.prototype;

JS.mixin(sceneProto, {
    isScene: true,

    /**
     * Create scene objects using previous serialized data.
     * @method create
     * @param {function} callback
     * @private
     */
    create: function (callback) {
        if (CC_EDITOR) {
            if (!this._dataToDeserialize) {
                cc.error('No need to create scene which not deserialized');
                return callback();
            }
        }
        var self = this;
        // deserialize (create wrappers)
        var json = this._dataToDeserialize;

        // 统计所有需要 preload 的 Asset
        var handle = cc.AssetLibrary.loadJson(
            json,
            function (err, data) {
                self._dataToDeserialize = null;
                var wrappers = data.c;
                if (CC_EDITOR) {
                    // fallback to old format
                    wrappers = wrappers || data;
                }
                function doCreate () {
                    // create scene node
                    self.createAndAttachNode();
                    // create remainder nodes
                    Fire.engine._isCloning = true;
                    initNodeAndChildren(wrappers, self.targetN, handle.wrapperToNode);
                    Fire.engine._isCloning = false;
                    // reassociate nodes
                    handle.wrapperToNode.apply();
                    //
                    callback();
                }
                var urls = Object.keys(handle.urlsNeedPreload);
                if (handle.assetsNeedPostLoad.length > 0 || urls.length > 0) {
                    // preload
                    self.preloadAssets(handle.assetsNeedPostLoad, urls, function () {
                        doCreate();
                    });
                }
                else {
                    doCreate();
                }
            },
            true, true, true
        );
    },

    /**
     * Init this scene wrapper from the previous serialized data.
     * @method _deserialize
     * @param {object} data - the serialized json data
     * @param {_Deserializer} ctx
     * @private
     */
    _deserialize: function (data, ctx) {
        // save temporarily for create()
        this._dataToDeserialize = data;
        if (data.length > 0) {
            this.uuid = data[0].uuid;
        }
    }
});

/**
 * @property {Boolean} _needCreate - Needs to call create().
 * @private
 */
JS.get(sceneProto, '_needCreate', function () {
    return !!this._dataToDeserialize;
});

// scene uuid will copy from assets
JS.getset(sceneProto, 'uuid',
    function () {
        return this._id;
    },
    function (value) {
        this._id = value;
    }
);

if (CC_EDITOR) {

    var serialize = require('../../editor/serialize');

    JS.mixin(sceneProto, {
        /**
         * The implement of serialization for the whole scene.
         * @method _serialize
         * @param {boolean} exporting
         * @return {object} the serialized json data object
         * @private
         */
        _serialize: function (exporting) {
            var childWrappers = dumpNodeForSerialization(this.targetN).c;
            var toSerialize = {
                c: childWrappers || [],
                uuid: this.uuid || ''
            };

            return serialize(toSerialize, {
                exporting: exporting,
                nicify: exporting,
                stringify: false
            });
        }
    });
}
