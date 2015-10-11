
var EngineWrapper = cc.FireClass({
    name: 'Runtime.EngineWrapper',
    extends: cc.Runtime.EngineWrapper,
    constructor: function () {
        this._scene = null;
    },

    properties: {
        canvasSize: {
            get: function () {
                var size = cc.view.getCanvasSize();
                return new cc.Vec2(size.width, size.height);
            },
            set: function (value) {
                var width = value.x;
                var height = value.y;

                var view = cc.view;

                cc.game.canvas.width = width * view.getDevicePixelRatio();
                cc.game.canvas.height = height * view.getDevicePixelRatio();

                cc.game.canvas.style.width = width;
                cc.game.canvas.style.height = height;

                // reset container style
                this.resetContainerStyle();

                cc.container.style.width = width;
                cc.container.style.height = height;

                var size = view.getDesignResolutionSize();
                view.setDesignResolutionSize(size.width, size.height, view.getResolutionPolicy());

                cc.eventManager.dispatchCustomEvent('canvas-resize');
            }
        },

        designResolution: {
            get: function () {
                var size = cc.view.getDesignResolutionSize();
                return new cc.Vec2(size.width, size.height);
            },
            set: function (value) {
                var width = value.x;
                var height = value.y;

                var view = cc.view;
                view.setDesignResolutionSize(value.x, value.y, view.getResolutionPolicy());
            }
        },

        _needAnimate: false,
        _needRender: true,
    },

    resetContainerStyle: function () {
        var style = cc.container.style;
        style.paddingTop = "0px";
        style.paddingRight = "0px";
        style.paddingBottom = "0px";
        style.paddingLeft = "0px";
        style.borderTop = "0px";
        style.borderRight = "0px";
        style.borderBottom = "0px";
        style.borderLeft = "0px";
        style.marginTop = "0px";
        style.marginRight = "0px";
        style.marginBottom = "0px";
        style.marginLeft = "0px";
    },

    initRuntime: function (options, callback) {
        var self = this;

        var config = {
            'width'                 : options.width,
            'height'                : options.height,
            'showFPS'               : false,
            'frameRate'             : 60,
            'id'                    : options.id,
            'renderMode'            : Fire.isEditor ? 2 : options.renderMode,                 // 0: auto, 1:Canvas, 2:Webgl
            'registerSystemEvent'   : Fire.isEditor ? false : true,
            'jsList'                : []
        };

        cc.game.run(config, function () {
            var scene = new cc.Scene();

            // scene anchor point need be 0,0
            scene.setAnchorPoint(0.0, 0.0);

            if (CC_EDITOR) {
                cc.view.enableRetina(false);
                cc.game.canvas.style.imageRendering = "pixelated";
                cc.director.setClearColor(cc.color(0,0,0,0));
            }

            cc.view.setDesignResolutionSize(options.designWidth, options.designHeight, cc.ResolutionPolicy.SHOW_ALL);

            if (cc.game.canvas) {
                self.canvasSize = new cc.Vec2(width, height);
            }

            self._setCurrentSceneN(scene);

            // dont update logic before rendering
            // cc.director.pause();
            cc.director._paused = true;

            if (CC_EDITOR) {
                // set cocos canvas tabindex to -1 in edit mode
                cc.game.canvas.setAttribute('tabindex', -1);
                cc.game.canvas.style.backgroundColor = '';
                if (cc.imeDispatcher._domInputControl)
                    cc.imeDispatcher._domInputControl.setAttribute('tabindex', -1);

                self._registerStepRuntime();
            }

            if (callback) {
                callback();
            }
        });
    },

    playRuntime: function () {
        if (CC_EDITOR) {
            this._registerCocosSystemEvent(cc.game.canvas);

            // reset cocos tabindex in playing mode
            cc.game.canvas.setAttribute('tabindex', 99);
            cc.game.canvas.style.backgroundColor = 'black';
            if (cc.imeDispatcher._domInputControl)
                cc.imeDispatcher._domInputControl.setAttribute('tabindex', 2);
        }

        cc.director.resume();
        cc.view.resizeWithBrowserSize(true);
    },

    stopRuntime: function () {

    },

    pauseRuntime: function () {
        cc.director.pause();
    },

    resumeRuntime: function () {
        cc.director.resume();
    },

    animateRuntime: function (dt) {
        this._needAnimate = true;
    },

    renderRuntime: function () {
        this._needRender = true;
    },

    _registerStepRuntime: function () {
        var self = this;
        var originDrawScene = cc.director.drawScene;

        cc.director.drawScene = function () {

            if ( !self.isPlaying && !self._needRender ) {
                return;
            }

            self._needRender = false;

            var engine = cc.engine;

            engine.emit('post-update');

            if (engine._stepOnce || (!self.isPlaying && engine._needAnimate)) {
                this._paused = false;
            }

            originDrawScene.call(this);

            if (engine._stepOnce || (!self.isPlaying && engine._needAnimate)) {
                this._paused = true;
                engine._stepOnce = false;
                engine._needAnimate = false;
            }
        }
    },

    _setCurrentSceneN: function (scene) {
        cc.director.runScene(scene);
        this._scene = scene;

        if (cc.director.setNextScene)
            cc.director.setNextScene();
    },

    getCurrentSceneN: function () {
        return cc.director.getRunningScene() || this._scene;
    },

    /**
     * Cocos will block event's propagation, it's not suitable for edit mode.
     * So hack cc.inputManager.registerSystemEvent, reregister cocos system event when play runtime.
     */
    _dontRegisterSystemEvent: function () {
        this._registerCocosSystemEvent = cc.inputManager.registerSystemEvent.bind( cc.inputManager );

        cc.inputManager.registerSystemEvent = function () {
        };
    },

    getIntersectionList: function (rect) {
        var scene = this.getCurrentScene();
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
    }
});

Runtime.EngineWrapper = module.exports = EngineWrapper;
