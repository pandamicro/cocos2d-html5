/**
 * An object to boot the game.
 * @class
 * @name cc.game
 */
cc.game = /** @lends cc.game# */{

    EVENT_HIDE: "game_on_hide",
    EVENT_SHOW: "game_on_show",
    EVENT_RESIZE: "game_on_resize",

    RENDER_TYPE_CANVAS: 0,
    RENDER_TYPE_WEBGL: 1,
    RENDER_TYPE_OPENGL: 2,

    _eventHide: null,
    _eventShow: null,

    /**
     * Key of config
     * @constant
     * @type {Object}
     */
    CONFIG_KEY: {
        width: "width",
        height: "height",
        engineDir: "engineDir",
        modules: "modules",
        debugMode: "debugMode",
        showFPS: "showFPS",
        frameRate: "frameRate",
        id: "id",
        renderMode: "renderMode",
        registerSystemEvent: "registerSystemEvent",
        jsList: "jsList",
        scenes: "scenes"
    },
    
    // states
    _paused: true,//whether the game is paused
    _isCloning: false,    // deserializing or instantiating
    _prepareCalled: false, //whether the prepare function has been called
    _prepared: false, //whether the engine has prepared
    _rendererInitialized: false,

    _renderContext: null,
    
    _intervalId: null,//interval target of main
    
    _lastTime: null,
    _frameTime: null,

    _loadingScene: '',
    // Scenes list
    _sceneInfos: [],

    /**
     * The outer frame of the game canvas, parent of cc.container
     * @type {Object}
     */
    frame: null,
    /**
     * The container of game canvas, equals to cc.container
     * @type {Object}
     */
    container: null,
    /**
     * The canvas of the game, equals to cc._canvas
     * @type {Object}
     */
    canvas: null,

    /**
     * Config of game
     * @type {Object}
     */
    config: null,

    /**
     * Callback when the scripts of engine have been load.
     * @type {Function}
     */
    onStart: null,

    /**
     * Callback when game exits.
     * @type {Function}
     */
    onStop: null,

//@Public Methods

//  @Game play control
    /**
     * Set frameRate of game.
     * @param frameRate
     */
    setFrameRate: function (frameRate) {
        var self = this, config = self.config, CONFIG_KEY = self.CONFIG_KEY;
        config[CONFIG_KEY.frameRate] = frameRate;
        if (self._intervalId)
            window.cancelAnimationFrame(self._intervalId);
        self._paused = true;
        self._setAnimFrame();
        self._runMainLoop();
    },

    /**
     * Run the game frame by frame.
     */
    step: function () {
        cc.director.mainLoop();
    },

    /**
     * Pause the game.
     */
    pause: function () {
        this._paused = true;

        if (this._intervalId)
            window.cancelAnimationFrame(this._intervalId);
        this._intervalId = 0;
    },

    /**
     * Resume the game from pause.
     */
    resume: function () {
        this._paused = false;
        this._runMainLoop();
    },

    /**
     * Check whether the game is paused.
     */
    isPaused: function () {
        return this._paused;
    },

    /**
     * Restart game.
     */
    restart: function () {
        cc.director.popToSceneStackLevel(0);
        // Clean up audio
        cc.audioEngine && cc.audioEngine.end();

        cc.game.onStart();
    },

//  @Game loading
    /**
     * Prepare game.
     * @param cb
     */
    prepare: function (cb) {
        var self = this,
            config = self.config, 
            CONFIG_KEY = self.CONFIG_KEY;

        this._loadConfig();

        // Already prepared
        if (this._prepared) {
            if (cb) cb();
            return;
        }
        // Prepare called, but not done yet
        if (this._prepareCalled) {
            return;
        }
        // Prepare never called and engine ready
        if (cc._engineLoaded) {
            this._prepareCalled = true;

            this._initRenderer(config[CONFIG_KEY.width], config[CONFIG_KEY.height]);

            /**
             * @type {cc.EGLView}
             * @name cc.view
             * @memberof cc
             * cc.view is the shared view object.
             */
            cc.view = cc.EGLView._getInstance();

            /**
             * @type {cc.Director}
             * @name cc.director
             * @memberof cc
             */
            cc.director = cc.Director._getInstance();
            if (cc.director.setOpenGLView)
                cc.director.setOpenGLView(cc.view);
            /**
             * @type {cc.Size}
             * @name cc.winSize
             * @memberof cc
             * cc.winSize is the alias object for the size of the current game window.
             */
            cc.winSize = cc.director.getWinSize();

            this._initEvents();

            this._setAnimFrame();
            this._runMainLoop();

            // Load game scripts
            var jsList = config[CONFIG_KEY.jsList];
            cc.loader.loadJsWithImg(jsList, function (err) {
                if (err) throw new Error(err);
                self._prepared = true;
                if (cb) cb();
            });

            return;
        }

        // Engine not loaded yet
        cc.initEngine(this.config, function () {
            self.prepare(cb);
        });
    },

    /**
     * Run game with configuration object and onStart function.
     * @param {Object|Function} [config] Pass configuration object or onStart function
     * @param {onStart} [onStart] onStart function to be executed after game initialized
     */
    run: function (config, onStart) {
        if (typeof config === 'function') {
            cc.game.onStart = config;
        }
        else {
            if (config) {
                cc.game.config = config;
            }
            if (typeof onStart === 'function') {
                cc.game.onStart = onStart;
            }
        }
        
        this.prepare(onStart && onStart.bind(cc.game));
    },

//  @Intersection list for editor
    getIntersectionList: function (rect) {
        var scene = cc(cc.director.getRunningScene());
        var list = [];

        scene._deepQueryChildren(function (child) {

            var bounds = child.getWorldBounds();

            // if intersect aabb success, then try intersect obb
            if (rect.intersects(bounds)) {
                bounds = child.getWorldOrientedBounds();
                var polygon = new cc.Polygon(bounds);

                if (Editor.Intersection.rectPolygon(rect, polygon)) {
                    list.push(child.targetN);
                }
            }

            return true;
        });

        return list;
    },

//  @Scene Loading
    /**
     * Loads the scene by its name.
     * @method loadScene
     * @param {string} sceneName - the name of the scene to load
     * @param {function} [onLaunched] - callback, will be called after scene launched
     * @param {function} [onUnloaded] - callback, will be called when the previous scene was unloaded
     * @return {boolean} if error, return false
     */
    loadScene: function (sceneName, onLaunched, onUnloaded) {
        var uuid, info;
        if (this._loadingScene) {
            cc.error('[loadScene] Failed to load scene "%s" because "%s" is already loading', sceneName, this._loadingScene);
            return false;
        }
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

//@Private Methods

//  @Time ticker section
    _setAnimFrame: function () {
        this._lastTime = new Date();
        this._frameTime = 1000 / cc.game.config[cc.game.CONFIG_KEY.frameRate];
        if((cc.sys.os === cc.sys.OS_IOS && cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT) || cc.game.config[cc.game.CONFIG_KEY.frameRate] !== 60) {
            window.requestAnimFrame = this._stTime;
            window.cancelAnimationFrame = this._ctTime;
        }
        else {
            window.requestAnimFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            this._stTime;
            window.cancelAnimationFrame = window.cancelAnimationFrame ||
            window.cancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.msCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.oCancelAnimationFrame ||
            this._ctTime;
        }
    },
    _stTime: function(callback){
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, cc.game._frameTime - (currTime - cc.game._lastTime));
        var id = window.setTimeout(function() { callback(); },
            timeToCall);
        cc.game._lastTime = currTime + timeToCall;
        return id;
    },
    _ctTime: function(id){
        window.clearTimeout(id);
    },
    //Run game.
    _runMainLoop: function () {
        var self = this, callback, config = self.config, CONFIG_KEY = self.CONFIG_KEY,
            director = cc.director;

        director.setDisplayStats(config[CONFIG_KEY.showFPS]);

        callback = function () {
            if (!self._paused) {
                director.mainLoop();
                if(self._intervalId)
                    window.cancelAnimationFrame(self._intervalId);
                self._intervalId = window.requestAnimFrame(callback);
            }
        };

        window.requestAnimFrame(callback);
        self._paused = false;
    },

//  @Game loading section
    _loadConfig: function () {
        // Load config
        // Already loaded
        if (this.config) {
            this._initConfig(this.config);
            return;
        }
        // Load from document.ccConfig
        if (document["ccConfig"]) {
            this._initConfig(document["ccConfig"]);
        }
        // Load from project.json 
        else {
            try {
                var cocos_script = document.getElementsByTagName('script');
                for(var i = 0; i < cocos_script.length; i++){
                    var _t = cocos_script[i].getAttribute('cocos');
                    if(_t === '' || _t) {
                        break;
                    }
                }
                var _src, txt, _resPath;
                if(i < cocos_script.length){
                    _src = cocos_script[i].src;
                    if(_src){
                        _resPath = /(.*)\//.exec(_src)[0];
                        cc.loader.resPath = _resPath;
                        _src = cc.path.join(_resPath, 'project.json');
                    }
                    txt = cc.loader._loadTxtSync(_src);
                }
                if(!txt){
                    txt = cc.loader._loadTxtSync("project.json");
                }
                var data = JSON.parse(txt);
                this._initConfig(data || {});
            } catch (e) {
                cc.log("Failed to read or parse project.json");
                this._initConfig({});
            }
        }
    },

    _initConfig: function (config) {
        var CONFIG_KEY = this.CONFIG_KEY,
            modules = config[CONFIG_KEY.modules];

        // Configs adjustment
        config[CONFIG_KEY.showFPS] = config[CONFIG_KEY.showFPS] || false;
        config[CONFIG_KEY.engineDir] = config[CONFIG_KEY.engineDir] || "frameworks/cocos2d-html5";
        if (config[CONFIG_KEY.debugMode] == null)
            config[CONFIG_KEY.debugMode] = 0;
        config[CONFIG_KEY.frameRate] = config[CONFIG_KEY.frameRate] || 60;
        if (config[CONFIG_KEY.renderMode] == null)
            config[CONFIG_KEY.renderMode] = 0;
        if (config[CONFIG_KEY.registerSystemEvent] == null)
            config[CONFIG_KEY.registerSystemEvent] = true;

        // Modules adjustment
        if (modules && modules.indexOf("core") < 0) modules.splice(0, 0, "core");
        modules && (config[CONFIG_KEY.modules] = modules);

        // Scene parser
        this._sceneInfos = this._sceneInfos.concat(config[CONFIG_KEY.scenes]);

        this.config = config;
    },

    _initRenderer: function (width, height) {
        // Avoid setup to be called twice.
        if (this._rendererInitialized) return;

        if (!cc._supportRender) {
            throw new Error("The renderer doesn't support the renderMode " + this.config[this.CONFIG_KEY.renderMode]);
        }

        var el = this.config[cc.game.CONFIG_KEY.id],
            win = window,
            element = cc.$(el) || cc.$('#' + el),
            localCanvas, localContainer, localConStyle;

        if (element.tagName === "CANVAS") {
            width = width || element.width;
            height = height || element.height;

            //it is already a canvas, we wrap it around with a div
            this.canvas = cc._canvas = localCanvas = element;
            this.container = cc.container = localContainer = document.createElement("DIV");
            if (localCanvas.parentNode)
                localCanvas.parentNode.insertBefore(localContainer, localCanvas);
        } else {
            //we must make a new canvas and place into this element
            if (element.tagName !== "DIV") {
                cc.log("Warning: target element is not a DIV or CANVAS");
            }
            width = width || element.clientWidth;
            height = height || element.clientHeight;
            this.canvas = cc._canvas = localCanvas = document.createElement("CANVAS");
            this.container = cc.container = localContainer = document.createElement("DIV");
            element.appendChild(localContainer);
        }
        localContainer.setAttribute('id', 'Cocos2dGameContainer');
        localContainer.appendChild(localCanvas);
        this.frame = (localContainer.parentNode === document.body) ? document.documentElement : localContainer.parentNode;

        localCanvas.addClass("gameCanvas");
        localCanvas.setAttribute("width", width || 480);
        localCanvas.setAttribute("height", height || 320);
        localCanvas.setAttribute("tabindex", 99);
        localCanvas.style.outline = "none";
        localConStyle = localContainer.style;
        localConStyle.width = (width || 480) + "px";
        localConStyle.height = (height || 320) + "px";
        localConStyle.margin = "0 auto";

        localConStyle.position = 'relative';
        localConStyle.overflow = 'hidden';
        localContainer.top = '100%';

        if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
            this._renderContext = cc._renderContext = cc.webglContext
             = cc.create3DContext(localCanvas, {
                'stencil': true,
                'preserveDrawingBuffer': true,
                'antialias': !cc.sys.isMobile,
                'alpha': true
            });
        }
        // WebGL context created successfully
        if (this._renderContext) {
            cc.renderer = cc.rendererWebGL;
            win.gl = this._renderContext; // global variable declared in CCMacro.js
            cc.shaderCache._init();
            cc._drawingUtil = new cc.DrawingPrimitiveWebGL(this._renderContext);
            cc.textureCache._initializingRenderer();
        } else {
            cc.renderer = cc.rendererCanvas;
            this._renderContext = cc._renderContext = new cc.CanvasContextWrapper(localCanvas.getContext("2d"));
            cc._drawingUtil = cc.DrawingPrimitiveCanvas ? new cc.DrawingPrimitiveCanvas(this._renderContext) : null;
        }

        cc._gameDiv = localContainer;
        cc.game.canvas.oncontextmenu = function () {
            if (!cc._isContextMenuEnable) return false;
        };

        this.dispatchEvent("rendererInited", true);

        this._rendererInitialized = true;
    },

    _initEvents: function () {
        var win = window, self = this, hidden, visibilityChange, _undef = "undefined";

        this._eventHide = this._eventHide || new cc.EventCustom(this.EVENT_HIDE);
        this._eventHide.setUserData(this);
        this._eventShow = this._eventShow || new cc.EventCustom(this.EVENT_SHOW);
        this._eventShow.setUserData(this);

        // register system events
        if (this.config[this.CONFIG_KEY.registerSystemEvent])
            cc.inputManager.registerSystemEvent(this.canvas);

        if (!cc.js.isUndefined(document.hidden)) {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (!cc.js.isUndefined(document.mozHidden)) {
            hidden = "mozHidden";
            visibilityChange = "mozvisibilitychange";
        } else if (!cc.js.isUndefined(document.msHidden)) {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (!cc.js.isUndefined(document.webkitHidden)) {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }

        var onHidden = function () {
            if (cc.eventManager && cc.game._eventHide)
                cc.eventManager.dispatchEvent(cc.game._eventHide);
        };
        var onShow = function () {
            if (cc.eventManager && cc.game._eventShow)
                cc.eventManager.dispatchEvent(cc.game._eventShow);
        };

        if (hidden) {
            document.addEventListener(visibilityChange, function () {
                if (document[hidden]) onHidden();
                else onShow();
            }, false);
        } else {
            win.addEventListener("blur", onHidden, false);
            win.addEventListener("focus", onShow, false);
        }

        if(navigator.userAgent.indexOf("MicroMessenger") > -1){
            win.onfocus = function(){ onShow() };
        }

        if ("onpageshow" in window && "onpagehide" in window) {
            win.addEventListener("pagehide", onHidden, false);
            win.addEventListener("pageshow", onShow, false);
        }

        cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function () {
            cc.audioEngine._pausePlaying();
        });
        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
            cc.audioEngine._resumePlaying();
        });

        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
            if(self._intervalId){
                window.cancelAnimationFrame(self._intervalId);

                self._runMainLoop();
            }
        });
    },

//  @Scene loading section
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
        if (CC_EDITOR && cc.engine && cc.engine._emptySceneN) {
            cc.director.runScene(cc.engine._emptySceneN);
        }

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
    }

    //launchNewScene: function () {
    //    var SceneWrapperImpl = cc(cc.director.getRunningScene()).constructor;
    //    var sceneWrapper = new SceneWrapperImpl();
    //    sceneWrapper.createAndAttachNode();
    //    cc.engine._launchScene(sceneWrapper);
    //}
};