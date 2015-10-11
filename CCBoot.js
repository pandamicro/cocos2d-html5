/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2015 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * The main namespace of Cocos2d-JS, all engine core classes, functions, properties and constants are defined in this namespace
 * @namespace
 * @name cc
 */
var cc = cc || {};
cc._tmp = cc._tmp || {};
cc._LogInfos = {};

/** @expose */
window._p = window;
/** @expose */
_p.gl;
/** @expose */
_p.WebGLRenderingContext;
/** @expose */
_p.DeviceOrientationEvent;
/** @expose */
_p.DeviceMotionEvent;
/** @expose */
_p.AudioContext;
if (!_p.AudioContext) {
    /** @expose */
    _p.webkitAudioContext;
}
/** @expose */
_p.mozAudioContext;
_p = Object.prototype;
/** @expose */
_p._super;
/** @expose */
_p.ctor;
delete window._p;

/**
 * Device oriented vertically, home button on the bottom
 * @constant
 * @type {Number}
 */
cc.ORIENTATION_PORTRAIT = 0;

/**
 * Device oriented vertically, home button on the top
 * @constant
 * @type {Number}
 */
cc.ORIENTATION_PORTRAIT_UPSIDE_DOWN = 1;

/**
 * Device oriented horizontally, home button on the right
 * @constant
 * @type {Number}
 */
cc.ORIENTATION_LANDSCAPE_LEFT = 2;

/**
 * Device oriented horizontally, home button on the left
 * @constant
 * @type {Number}
 */
cc.ORIENTATION_LANDSCAPE_RIGHT = 3;

/**
 * drawing primitive of game engine
 * @type {cc.DrawingPrimitive}
 */
cc._drawingUtil = null;

/**
 * main Canvas 2D/3D Context of game engine
 * @type {CanvasRenderingContext2D|WebGLRenderingContext}
 */
cc._renderContext = null;
cc._supportRender = false;

/**
 * Main canvas of game engine
 * @type {HTMLCanvasElement}
 */
cc._canvas = null;

/**
 * The element contains the game canvas
 * @type {HTMLDivElement}
 */
cc.container = null;
cc._gameDiv = null;

cc.newElement = function (x) {
    return document.createElement(x);
};

cc.isEditor = typeof Editor !== 'undefined';

// if global_defs not declared by uglify, declare them globally
// (use eval to ignore uglify)
if (typeof CC_EDITOR === 'undefined') {
    eval('CC_EDITOR=cc.isEditor');
}
if (typeof CC_DEV === 'undefined') {
    eval('CC_DEV=CC_EDITOR');
}
if (typeof CC_TEST === 'undefined') {
    if (CC_EDITOR) {
        eval('CC_TEST=typeof describe!=="undefined"');
    }
    else {
        eval('CC_TEST=typeof QUnit!=="undefined"');
    }
}
if (CC_TEST) {
    // contains internal apis for unit tests
    // @expose
    cc._Test = {};
}

/**
 * Iterate over an object or an array, executing a function for each matched element.
 * @param {object|array} obj
 * @param {function} iterator
 * @param {object} [context]
 */
cc.each = function (obj, iterator, context) {
    if (!obj)
        return;
    if (obj instanceof Array) {
        for (var i = 0, li = obj.length; i < li; i++) {
            if (iterator.call(context, obj[i], i) === false)
                return;
        }
    } else {
        for (var key in obj) {
            if (iterator.call(context, obj[key], key) === false)
                return;
        }
    }
};

/**
 * Check the url whether cross origin
 * @param {String} url
 * @returns {boolean}
 */
cc.isCrossOrigin = function (url) {
    if (!url) {
        cc.log("invalid URL");
        return false;
    }
    var startIndex = url.indexOf("://");
    if (startIndex === -1)
        return false;

    var endIndex = url.indexOf("/", startIndex + 3);
    var urlOrigin = (endIndex === -1) ? url : url.substring(0, endIndex);
    return urlOrigin !== location.origin;
};

/**
 * A string tool to construct a string with format string.
 * for example:
 *      cc.formatStr("a: %d, b: %b", a, b);
 *      cc.formatStr(a, b, c);
 * @returns {String}
 */
cc.formatStr = function(){
    var args = arguments;
    var l = args.length;
    if(l < 1)
        return "";

    var str = args[0];
    var needToFormat = true;
    if(typeof str === "object"){
        needToFormat = false;
    }
    for(var i = 1; i < l; ++i){
        var arg = args[i];
        if(needToFormat){
            while(true){
                var result = null;
                if(typeof arg === "number"){
                    result = str.match(/(%d)|(%s)/);
                    if(result){
                        str = str.replace(/(%d)|(%s)/, arg);
                        break;
                    }
                }
                result = str.match(/%s/);
                if(result)
                    str = str.replace(/%s/, arg);
                else
                    str += "    " + arg;
                break;
            }
        }else
            str += "    " + arg;
    }
    return str;
};

var FireUrl = CC_EDITOR && !CC_TEST && require('fire-url');

require('./cocos2d/core/utils/Async');
require('./cocos2d/core/platform/CCLoader');
require('./cocos2d/core/platform/CCSys');
require('./cocos2d/core/utils/CCPath');


//+++++++++++++++++++++++++Engine initialization function begin+++++++++++++++++++++++++++
(function () {

//to make sure the cc.log, cc.warn, cc.error, cc.throw and cc.assert would not throw error before init by debugger mode.
cc.log = cc.warn = cc.error = cc.throw = cc.assert = function () {
};

var _jsAddedCache = {}, //cache for js and module that has added into jsList to be loaded.
    _engineInitCalled = false,
    _engineLoadedCallback = null;

cc._engineLoaded = false;

function _determineRenderType(config) {
    var CONFIG_KEY = cc.game.CONFIG_KEY;

    // Adjust RenderType
    config[CONFIG_KEY.renderMode] = parseInt(config[CONFIG_KEY.renderMode]) || 0;
    if (isNaN(userRenderMode) || userRenderMode > 2 || userRenderMode < 0)
        config[CONFIG_KEY.renderMode] = 0;

    // Determine RenderType
    var userRenderMode = config[CONFIG_KEY.renderMode];
    var shieldOs = [cc.sys.OS_ANDROID];
    var shieldBrowser = [];
    cc._renderType = cc.game.RENDER_TYPE_CANVAS;
    cc._supportRender = true;

    if ( userRenderMode === 2 || 
        (   userRenderMode === 0 && 
            shieldOs.indexOf(cc.sys.os) === -1 && 
            shieldBrowser.indexOf(cc.sys.browserType) === -1 )) {
        if (cc.sys.capabilities["opengl"]) {
            cc._renderType = cc.game.RENDER_TYPE_WEBGL;
            cc._supportRender = true;
        }
        else {
            cc._supportRender = false;
        }
    }
    if (userRenderMode === 1
        || (userRenderMode === 0 && !cc._supportRender)) {
        if (cc.sys.capabilities["canvas"]) {
            cc._renderType = cc.game.RENDER_TYPE_CANVAS;
            cc._supportRender = true;
        }
        else {
            cc._supportRender = false;
        }
    }
}

function _getJsListOfModule(moduleMap, moduleName, dir) {
    if (_jsAddedCache[moduleName]) return null;
    dir = dir || "";
    var jsList = [];
    var tempList = moduleMap[moduleName];
    if (!tempList) throw new Error("can not find module [" + moduleName + "]");
    var ccPath = cc.path;
    for (var i = 0, li = tempList.length; i < li; i++) {
        var item = tempList[i];
        if (_jsAddedCache[item]) continue;
        var extname = ccPath.extname(item);
        if (!extname) {
            var arr = _getJsListOfModule(moduleMap, item, dir);
            if (arr) jsList = jsList.concat(arr);
        } else if (extname.toLowerCase() === ".js") jsList.push(ccPath.join(dir, item));
        _jsAddedCache[item] = 1;
    }
    return jsList;
}

function _afterEngineLoaded(config) {
    cc._initDebugSetting(config[cc.game.CONFIG_KEY.debugMode]);
    cc._engineLoaded = true;
    cc.log(cc.ENGINE_VERSION);
    if (_engineLoadedCallback) _engineLoadedCallback();
}

function _load(config) {
    var self = this;
    var CONFIG_KEY = cc.game.CONFIG_KEY, engineDir = config[CONFIG_KEY.engineDir], loader = cc.loader;

    if (cc.Class) {
        // Single file loaded
        _afterEngineLoaded(config);
    } else {
        // Load cocos modules
        var ccModulesPath = cc.path.join(engineDir, "moduleConfig.json");
        loader.loadJson(ccModulesPath, function (err, modulesJson) {
            if (err) throw new Error(err);
            var modules = config["modules"] || [];
            var moduleMap = modulesJson["module"];
            var jsList = [];
            if (cc.sys.supportWebGL && modules.indexOf("base4webgl") < 0) modules.splice(0, 0, "base4webgl");
            else if (modules.indexOf("core") < 0) modules.splice(0, 0, "core");
            for (var i = 0, li = modules.length; i < li; i++) {
                var arr = _getJsListOfModule(moduleMap, modules[i], engineDir);
                if (arr) jsList = jsList.concat(arr);
            }
            cc.loader.loadJsWithImg(jsList, function (err) {
                if (err) throw err;
                _afterEngineLoaded(config);
            });
        });
    }
}

function _windowLoaded() {
    this.removeEventListener('load', _windowLoaded, false);
    _load(cc.game.config);
}

cc.initEngine = function (config, cb) {
    if (_engineInitCalled) {
        var previousCallback = _engineLoadedCallback;
        _engineLoadedCallback = function () {
            previousCallback && previousCallback();
            cb && cb();
        }
        return;
    }

    _engineLoadedCallback = cb;

    // Given config, initialize with it
    if (config) {
        cc.game.config = config;
    }
    // No config given and no config set before, load it
    else if (!cc.game.config) {
        cc.game._loadConfig();
    }
    config = cc.game.config;

    _determineRenderType(config);

    document.body ? _load(config) : cc._addEventListener(window, 'load', _windowLoaded, false);
    _engineInitCalled = true;
}

})();
//+++++++++++++++++++++++++Engine initialization function end+++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about CCGame begin+++++++++++++++++++++++++++
/**
 * An object to boot the game.
 * @class
 * @name cc.game
 */
cc.game = /** @lends cc.game# */{
    DEBUG_MODE_NONE: 0,
    DEBUG_MODE_INFO: 1,
    DEBUG_MODE_WARN: 2,
    DEBUG_MODE_ERROR: 3,
    DEBUG_MODE_INFO_FOR_WEB_PAGE: 4,
    DEBUG_MODE_WARN_FOR_WEB_PAGE: 5,
    DEBUG_MODE_ERROR_FOR_WEB_PAGE: 6,

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
        jsList: "jsList"
    },

    _prepareCalled: false,//whether the prepare function has been called
    _checkPrepare: null,
    _prepared: false,//whether the engine has prepared
    _rendererInitialized: false,
    _renderContext: null,
    
    _paused: true,//whether the game is paused
    _intervalId: null,//interval target of main
    
    _lastTime: null,
    _frameTime: null,

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
     * Restart game.
     */
    restart: function () {
        cc.director.popToSceneStackLevel(0);
        // Clean up audio
        cc.audioEngine && cc.audioEngine.end();

        cc.game.onStart();
    },

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
            this._checkPrepare && clearInterval(this._checkPrepare);

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
        if (cc.isFunction(config)) {
            cc.game.onStart = config;
        }
        else {
            if (config) {
                cc.game.config = config;
            }
            if (cc.isFunction(onStart)) {
                cc.game.onStart = onStart;
            }
        }
        
        this.prepare(cc.game.onStart.bind(cc.game));
    },

    _loadConfig: function () {
        // Load config
        // Already loaded
        if (cc.game.config) {
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
        if (modules && modules.indexOf("core") < 0) modules.splice(0, 0, "core");

        modules && (config[CONFIG_KEY.modules] = modules);
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

        if (!el) {
            width = width || 640;
            height = height || 480;
            this.canvas = cc._canvas = localCanvas = document.createElement("CANVAS");
            this.container = cc.container = localContainer = document.createElement("DIV");
            localContainer.setAttribute('id', 'Cocos2dGameContainer');
        } else if (element.tagName === "CANVAS") {
            width = width || element.width;
            height = height || element.height;

            //it is already a canvas, we wrap it around with a div
            this.canvas = cc._canvas = localCanvas = element;
            this.container = cc.container = localContainer = document.createElement("DIV");
            if (localCanvas.parentNode)
                localCanvas.parentNode.insertBefore(localContainer, localCanvas);
            localContainer.setAttribute('id', 'Cocos2dGameContainer');
        } else {//we must make a new canvas and place into this element
            if (element.tagName !== "DIV") {
                cc.log("Warning: target element is not a DIV or CANVAS");
            }
            width = width || element.clientWidth;
            height = height || element.clientHeight;
            this.canvas = cc._canvas = localCanvas = document.createElement("CANVAS");
            this.container = cc.container = localContainer = element;
        }
        localContainer.appendChild(localCanvas);

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
        if (this._renderContext) {
            win.gl = this._renderContext; // global variable declared in CCMacro.js
            cc.shaderCache._init();
            cc._drawingUtil = new cc.DrawingPrimitiveWebGL(this._renderContext);
            cc.textureCache._initializingRenderer();
        } else {
            this._renderContext = cc._renderContext = new cc.CanvasContextWrapper(localCanvas.getContext("2d"));
            cc._drawingUtil = cc.DrawingPrimitiveCanvas ? new cc.DrawingPrimitiveCanvas(this._renderContext) : null;
        }

        cc._gameDiv = localContainer;
        cc._canvas.oncontextmenu = function () {
            if (!cc._isContextMenuEnable) return false;
        };

        this._rendererInitialized = true;
    },

    _initEvents: function () {
        var win = window, self = this, hidden, visibilityChange, _undef = "undefined";

        // register system events
        if (this.config[this.CONFIG_KEY.registerSystemEvent])
            cc.inputManager.registerSystemEvent(this.canvas);

        if (!cc.isUndefined(document.hidden)) {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (!cc.isUndefined(document.mozHidden)) {
            hidden = "mozHidden";
            visibilityChange = "mozvisibilitychange";
        } else if (!cc.isUndefined(document.msHidden)) {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (!cc.isUndefined(document.webkitHidden)) {
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
    }
};
//+++++++++++++++++++++++++something about CCGame end+++++++++++++++++++++++++++++

Function.prototype.bind = Function.prototype.bind || function (oThis) {
    if (!cc.isFunction(this)) {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
            return fToBind.apply(this instanceof fNOP && oThis
                ? this
                : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
};

cc._urlRegExp = new RegExp(
    "^" +
        // protocol identifier
        "(?:(?:https?|ftp)://)" +
        // user:pass authentication
        "(?:\\S+(?::\\S*)?@)?" +
        "(?:" +
            // IP address dotted notation octets
            // excludes loopback network 0.0.0.0
            // excludes reserved space >= 224.0.0.0
            // excludes network & broacast addresses
            // (first & last IP address of each class)
            "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
            "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
            "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
        "|" +
            // host name
            "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
            // domain name
            "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
            // TLD identifier
            "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
        "|" +
            "(?:localhost)" +
        ")" +
        // port number
        "(?::\\d{2,5})?" +
        // resource path
        "(?:/\\S*)?" +
    "$", "i"
);

require('../cocos2d/core/platform/js');
