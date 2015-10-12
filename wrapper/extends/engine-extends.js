var JS = cc.js;
var SceneWrapper = require('../wrappers/scene');

/**
 * @module cc.Runtime
 */

/**
 * @class EngineWrapper
 */

var EngineWrapper = require('../wrappers/engine');
var engineProto = EngineWrapper.prototype;


JS.mixin(engineProto, {

    _initScene: function (sceneWrapper, callback) {
        if (sceneWrapper._needCreate) {
            sceneWrapper.create(callback);
        }
        else {
            callback();
        }
    },

    /**
     * Launch loaded scene.
     * @method _launchScene
     * @param {SceneWrapper} scene
     * @param {function} [onBeforeLoadScene]
     * @private
     */
    _launchScene: function (scene, onBeforeLoadScene) {
        var self = this;

        if (!scene) {
            cc.error('Argument must be non-nil');
            return;
        }

        if (scene._needCreate && CC_EDITOR) {
            cc.error('The scene wrapper %s is not yet fully created', scene.name);
            return;
        }

        //Engine._dontDestroyEntities.length = 0;

        //// unload scene
        //var oldScene = Engine._scene;
        //
        ////editorCallback.onStartUnloadScene(oldScene);
        //
        //if (cc.isValid(oldScene)) {
        //    // destroyed and unload
        //    AssetLibrary.unloadAsset(oldScene, true);
        //}
        //
        //// purge destroyed entities belongs to old scene
        //CCObject._deferredDestroy();
        //
        //Engine._scene = null;

        // destroy last scene
        cc.director.runScene(this._emptySceneN);

        if (onBeforeLoadScene) {
            onBeforeLoadScene();
        }

        self.emit('pre-launch-scene');

        //// init scene
        //Engine._renderContext.onSceneLoaded(scene);

        ////if (editorCallback.onSceneLoaded) {
        ////    editorCallback.onSceneLoaded(scene);
        ////}

        //// launch scene
        //scene.entities = scene.entities.concat(Engine._dontDestroyEntities);
        //Engine._dontDestroyEntities.length = 0;
        cc.director.runScene(scene.targetN);
        //Engine._renderContext.onSceneLaunched(scene);

        //editorCallback.onBeforeActivateScene(scene);

        scene._onActivated();

        //editorCallback.onSceneLaunched(scene);
    },

    /**
     * Loads the scene by its name.
     * @method loadScene
     * @param {string} sceneName - the name of the scene to load
     * @param {function} [onLaunched] - callback, will be called after scene launched
     * @param {function} [onUnloaded] - callback, will be called when the previous scene was unloaded
     * @return {boolean} if error, return false
     */
    loadScene: function (sceneName, onLaunched, onUnloaded) {
        if (this._loadingScene) {
            cc.error('[loadScene] Failed to load scene "%s" because "%s" is already loading', sceneName, this._loadingScene);
            return false;
        }
        var uuid, info;
        if (typeof sceneName === 'string') {
            if (!sceneName.endsWith('.fire')) {
                sceneName += '.fire';
            }
            if (sceneName[0] !== '/' && !sceneName.startsWith('assets://')) {
                sceneName = '/' + sceneName;    // 使用全名匹配
            }
            // search scene
            for (var i = 0; i < this._sceneInfos.length; i++) {
                info = this._sceneInfos[i];
                var url = info.url;
                if (url.endsWith(sceneName)) {
                    uuid = info.uuid;
                    break;
                }
            }
        }
        else {
            info = this._sceneInfos[sceneName];
            if (typeof info === 'object') {
                uuid = info.uuid;
            }
            else {
                cc.error('[loadScene] The scene index to load (%s) is out of range.', sceneName);
                return false;
            }
        }
        if (uuid) {
            this._loadingScene = sceneName;
            this._loadSceneByUuid(uuid, onLaunched, onUnloaded);
            return true;
        }
        else {
            cc.error('[loadScene] Can not load the scene "%s" because it has not been added to the build settings before play.', sceneName);
            return false;
        }
    },

    /**
     * Loads the scene by its uuid.
     * @method _loadSceneByUuid
     * @param {string} uuid - the uuid of the scene asset to load
     * @param {function} [onLaunched]
     * @param {function} [onUnloaded]
     * @private
     */
    _loadSceneByUuid: function (uuid, onLaunched, onUnloaded) {
        var self = this;
        //cc.AssetLibrary.unloadAsset(uuid);     // force reload
        cc.AssetLibrary.loadAsset(uuid, function (error, scene) {
            if (error) {
                error = 'Failed to load scene: ' + error;
                if (CC_EDITOR) {
                    console.assert(false, error);
                }
            }
            else {
                var uuid = scene._uuid;
                scene = scene.scene;    // Currently our scene not inherited from Asset, so need to extract scene from dummy asset
                if (scene instanceof SceneWrapper) {
                    scene.uuid = uuid;
                }
                else {
                    error = 'The asset ' + uuid + ' is not a scene';
                    scene = null;
                }
            }
            if (scene) {
                self._initScene(scene, function () {
                    self._launchScene(scene, onUnloaded);
                    self._loadingScene = '';
                    if (onLaunched) {
                        onLaunched(error, scene);
                    }
                });
            }
            else {
                cc.error(error);
                self._loadingScene = '';
                if (onLaunched) {
                    onLaunched(error, scene);
                }
            }
        });
    },

    //launchNewScene: function () {
    //    var SceneWrapperImpl = cc(cc.director.getRunningScene()).constructor;
    //    var sceneWrapper = new SceneWrapperImpl();
    //    sceneWrapper.createAndAttachNode();
    //    cc.engine._launchScene(sceneWrapper);
    //}
});
