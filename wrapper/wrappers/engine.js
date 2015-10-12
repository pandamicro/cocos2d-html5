/**
 * @module cc.Runtime
 */

var JS = cc.js;
var Ticker = Fire._Ticker;
var Time = Fire.Time;

var Utils = require('./utils');
var NYI = Utils.NYI;
var NYI_Accessor = Utils.NYI_Accessor;

//var SceneWrapper = require('./scene');

/**
 * !#zh 这个类用来封装编辑器对引擎的操作，并且提供运行时的一些全局接口和状态。
 * 可以通过 `cc.engine` 来访问当前的 runtime wrapper。
 * !#en Access to engine runtime data.
 * This class contains methods for looking up information about and controlling the runtime data.
 * You can access this class using `cc.engine`.
 *
 * You should override:
 * - initRuntime
 * - playRuntime
 * - updateRuntime
 * - animateRuntime
 * - renderRuntime
 * - canvasSize
 * - getIntersectionList
 *
 * You may want to override:
 * - tick (if useDefaultMainLoop)
 * - tickInEditMode
 * - designResolution
 *
 * @class EngineWrapper
 * @extends Playable
 * @constructor
 * @param {boolean} useDefaultMainLoop - if true, tick() will be invoked every frame
 */
var EngineWrapper = cc.FireClass({
    name: 'cc.Runtime.EngineWrapper',
    extends: Fire.Playable,

    constructor: function () {
        var useDefaultMainLoop = arguments[0];

        /**
         * We should use this id to cancel ticker, otherwise if the engine stop and replay immediately,
         * last ticker will not cancel correctly.
         *
         * @property _requestId
         * @type {number}
         * @private
         */
        this._requestId = -1;

        this._useDefaultMainLoop = useDefaultMainLoop;
        this._isInitializing = false;
        this._isInitialized = false;

        // Scene list
        this._sceneInfos = [];

        // current scene
        this._loadingScene = '';
        this._emptySceneN = null;

        this._bindedTick = (CC_EDITOR || useDefaultMainLoop) && this._tick.bind(this);

        // states
        this._isCloning = false;    // deserializing or instantiating
        //this._isLockingScene = false;

        if (CC_EDITOR) {
            /**
             * The maximum value the Time.deltaTime in edit mode.
             * @property maxDeltaTimeInEM
             * @type {Number}
             * @private
             */
            this.maxDeltaTimeInEM = 1 / 30;
            /**
             * Is playing animation in edit mode.
             * @property animatingInEditMode
             * @type {Boolean}
             * @private
             */
            this.animatingInEditMode = false;

            this._shouldRepaintInEM = false;
            this._forceRepaintId = -1;

            // used in getInstanceById and editor only
            this.attachedWrappersForEditor = {};

            var attachedWrappersForEditor = this.attachedWrappersForEditor;
            this.on('node-detach-from-scene', function (event) {
                var node = event.detail.targetN;
                if (node) {
                    var uuid = cc(node).uuid;
                    if (uuid) {
                        delete attachedWrappersForEditor[uuid];
                    }
                }
            });
            this.on('node-attach-to-scene', function (event) {
                var node = event.detail.targetN;
                if (node) {
                    var wrapper = cc(node);
                    var uuid = wrapper.uuid;
                    if (uuid) {
                        attachedWrappersForEditor[uuid] = wrapper;
                    }
                }
            });
        }
    },

    properties: {
        /**
         * @property {boolean} isInitialized - Indicates whether the engine instance is initialized.
         * @readOnly
         */
        isInitialized: {
            get: function () {
                return this._isInitialized;
            }
        },

        /**
         * @property {boolean} loadingScene
         * @readOnly
         */
        loadingScene: {
            get: function () {
                return this._loadingScene;
            }
        },

        /**
         * @property {cc.Vec2} canvasSize - Resize the rendering canvas.
         */
        canvasSize: NYI_Accessor(cc.Vec2.zero),

        /**
         * @property {cc.Vec2} designResolution
         */
        designResolution: {
            get: function () { return cc.Vec2.zero; },
            set: function (value) {}
        },

        /**
         * The interval(ms) every time the engine force to repaint the scene in edit mode.
         * If don't need, set this to 0.
         * @property forceRepaintIntervalInEM
         * @type {Number}
         * @private
         */
        forceRepaintIntervalInEM: {
            default: 500,
            notify: CC_EDITOR && function () {
                if (this._forceRepaintId !== -1) {
                    clearInterval(this._forceRepaintId);
                }
                if (this.forceRepaintIntervalInEM > 0) {
                    var self = this;
                    this._forceRepaintId = setInterval(function () {
                        self.repaintInEditMode();
                    }, this.forceRepaintIntervalInEM);
                }
            }
        }
    },

    // TO OVERRIDE

    /**
     * @callback InitCallback
     * @param {string} [error] - null or the error info
     */

    /**
     * Initialize the runtime. This method will be called by init method.
     * @method initRuntime
     * @param {object} options
     * @param {number} options.width
     * @param {number} options.height
     * @param {Canvas} [options.canvas]
     * @param {InitCallback} callback
     */
    initRuntime: function (options, callback) {
        NYI();
        callback();
    },

    /**
     * Starts playback.
     * @method playRuntime
     */
    playRuntime: NYI,

    /**
     * Update phase, will not invoked in edit mode.
     * Use this method to update your engine logic, such as input logic and game logic.
     * @method updateRuntime
     */
    updateRuntime: NYI,
    /**
     * Animate phase, called after updateRuntime.
     * Use this method to update your particle and animation.
     * @method animateRuntime
     */
    animateRuntime: NYI,
    /**
     * Render phase, called after animateRuntime.
     * Use this method to render your scene.
     * @method renderRuntime
     */
    renderRuntime: NYI,

    ///**
    // * Steps playback.
    // * @method stepRuntime
    // */
    //stepRuntime: NYI,

    /**
     * This method will be invoke only if useDefaultMainLoop is true.
     * @method tick
     * @param {number} deltaTime
     * @param {boolean} updateLogic
     */
    tick: function (deltaTime, updateLogic) {
        if (updateLogic) {
            this.updateRuntime(deltaTime);
            this.animateRuntime(deltaTime);
            this.emit('post-update');
        }
        this.renderRuntime();
    },

    /**
     * This method will be invoked in edit mode even if useDefaultMainLoop is false.
     * @method tickInEditMode
     * @param {number} deltaTime
     * @param {boolean} updateAnimate
     */
    tickInEditMode: function (deltaTime, updateAnimate) {
        if (CC_EDITOR) {
            // invoke updateInEditMode
            cc(cc.director.getRunningScene())._callUpdateInEM(deltaTime);

            if (updateAnimate) {
                this.animateRuntime(deltaTime);
            }
            this.emit('post-update');
            this.renderRuntime();
        }
    },

    /**
     * Pick nodes that lie within a specified screen rectangle.
     * @method getIntersectionList
     * @param {cc.Rect} rect - An rectangle specified with world coordinates.
     * @return {RuntimeNode[]}
     */
    getIntersectionList: NYI,

    // PUBLIC

    /**
     * Initialize the engine. This method will be called by boot.js or editor.
     * @method init
     * @param {object} options
     * @param {number} options.width
     * @param {number} options.height
     * @param {string} options.rawUrl
     * @param {Canvas} [options.canvas]
     * @param {initCallback} callback
     */
    init: function (options, callback) {
        if (this._isInitializing) {
            cc.error('Engine already initialized');
            return;
        }
        this._isInitializing = true;

        this._sceneInfos = this._sceneInfos.concat(options.scenes);
        //if (options.rawUrl) {
        //    cc.url.rawUrl = cc.path._setEndWithSep(options.rawUrl, true, '/');
        //}
        //Resources._resBundle.init(options.resBundle);

        cc.Runtime.Helpers.init();

        var self = this;
        this.initRuntime(options, function (err) {
            if (!err) {
                if (CC_EDITOR && Editor.isPageLevel) {
                    cc.Runtime.registerToCore();
                }
                //var scene = cc.director.getRunningScene()
                //if (editorCallback.onSceneLoaded) {
                //    editorCallback.onSceneLoaded(this._scene);
                //}
            }

            self._isInitialized = true;
            self._isInitializing = false;

            callback(err);

            if (CC_EDITOR) {
                // start main loop for editor after initialized
                self._tickStart();
                // start timer to force repaint the scene in edit mode
                self.forceRepaintIntervalInEM = self.forceRepaintIntervalInEM;
            }

            // create empty scene
            var scene = new (cc(cc.director.getRunningScene()).constructor)();
            scene.createAndAttachNode();
            self._emptySceneN = scene.targetN;
            scene.retain();
        });
    },

    repaintInEditMode: function () {
        if (CC_EDITOR && !this._isUpdating) {
            this._shouldRepaintInEM = true;
        }
    },

    // OVERRIDE

    onError: function (error) {
        if (CC_EDITOR) {
            switch (error) {
                case 'already-playing':
                    cc.warn('Fireball is already playing');
                    break;
            }
        }
    },
    onResume: function () {
        // if (CC_EDITOR) {
        //     CCObject._clearDeferredDestroyTimer();
        //     editorCallback.onEnginePlayed(true);
        // }
        cc.game.resume();

        if (CC_EDITOR && !this._useDefaultMainLoop) {
            this._tickStop();
        }
    },
    onPause: function () {
        // if (CC_EDITOR) {
        //     editorCallback.onEnginePaused();
        // }
        cc.game.pause();

        if (CC_EDITOR) {
            // start tick for edit mode
            this._tickStart();
        }
    },
    onPlay: function () {
        //if (CC_EDITOR && ! this._isPaused) {
        //    CCObject._clearDeferredDestroyTimer();
        //}

        this.playRuntime();

        this._shouldRepaintInEM = false;
        if (this._useDefaultMainLoop) {
            // reset timer for default main loop
            var now = Ticker.now();
            Time._restart(now);
            //
            this._tickStart();
        }
        else if (CC_EDITOR) {
            // dont tick in play mode
            this._tickStop();
        }

        //if (CC_EDITOR) {
        //    editorCallback.onEnginePlayed(false);
        //}
    },

    onStop: function () {
        //CCObject._deferredDestroy();

        cc.game.pause();

        // reset states
        this._loadingScene = ''; // TODO: what if loading scene ?

        if (CC_EDITOR) {
            // start tick for edit mode
            this.repaintInEditMode();
            this._tickStart();
        }

        //if (CC_EDITOR) {
        //    editorCallback.onEngineStopped();
        //}
    },

    // PRIVATE

    /**
     * @method _tick
     * @private
     */
    _tick: function (unused) {
        this._requestId = Ticker.requestAnimationFrame(this._bindedTick);

        var now = Ticker.now();
        if (this._isUpdating || this._stepOnce) {
            // play mode

            //if (sceneLoadingQueue) {
            //    return;
            //}
            Time._update(now, false, this._stepOnce ? 1 / 60 : 0);
            this._stepOnce = false;

            //if (this._scene) {
                this.tick(Time.deltaTime, true);
            //}
        }
        else if (CC_EDITOR) {
            // edit mode
            Time._update(now, false, this.maxDeltaTimeInEM);
            if (this._shouldRepaintInEM || this.animatingInEditMode) {
                this.tickInEditMode(Time.deltaTime, this.animatingInEditMode);
                this._shouldRepaintInEM = false;
            }
        }
    },

    _tickStart: function () {
        if (this._requestId === -1) {
            this._tick();
        }
    },

    _tickStop: function () {
        if (this._requestId !== -1) {
            Ticker.cancelAnimationFrame(this._requestId);
            this._requestId = -1;
        }
    }
});

/**
 * @event node-attach-to-scene
 * @param {CustomEvent} event
 * @param {RuntimeNode} event.detail.targetN
 * @private
 */

/**
 * @event node-detach-from-scene
 * @param {CustomEvent} event
 * @param {RuntimeNode} event.detail.targetN
 * @private
 */

/**
 * @event post-update
 * @private
 */

/**
 * @event pre-launch-scene
 * @private
 */

module.exports = EngineWrapper;
