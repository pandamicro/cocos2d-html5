
if (cc.sys) return;

/**
 * System variables
 * @namespace
 * @name cc.sys
 */
cc.sys = {};
var sys = cc.sys;

/**
 * English language code
 * @memberof cc.sys
 * @name LANGUAGE_ENGLISH
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_ENGLISH = "en";

/**
 * Chinese language code
 * @memberof cc.sys
 * @name LANGUAGE_CHINESE
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_CHINESE = "zh";

/**
 * French language code
 * @memberof cc.sys
 * @name LANGUAGE_FRENCH
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_FRENCH = "fr";

/**
 * Italian language code
 * @memberof cc.sys
 * @name LANGUAGE_ITALIAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_ITALIAN = "it";

/**
 * German language code
 * @memberof cc.sys
 * @name LANGUAGE_GERMAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_GERMAN = "de";

/**
 * Spanish language code
 * @memberof cc.sys
 * @name LANGUAGE_SPANISH
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_SPANISH = "es";

/**
 * Spanish language code
 * @memberof cc.sys
 * @name LANGUAGE_DUTCH
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_DUTCH = "du";

/**
 * Russian language code
 * @memberof cc.sys
 * @name LANGUAGE_RUSSIAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_RUSSIAN = "ru";

/**
 * Korean language code
 * @memberof cc.sys
 * @name LANGUAGE_KOREAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_KOREAN = "ko";

/**
 * Japanese language code
 * @memberof cc.sys
 * @name LANGUAGE_JAPANESE
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_JAPANESE = "ja";

/**
 * Hungarian language code
 * @memberof cc.sys
 * @name LANGUAGE_HUNGARIAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_HUNGARIAN = "hu";

/**
 * Portuguese language code
 * @memberof cc.sys
 * @name LANGUAGE_PORTUGUESE
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_PORTUGUESE = "pt";

/**
 * Arabic language code
 * @memberof cc.sys
 * @name LANGUAGE_ARABIC
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_ARABIC = "ar";

/**
 * Norwegian language code
 * @memberof cc.sys
 * @name LANGUAGE_NORWEGIAN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_NORWEGIAN = "no";

/**
 * Polish language code
 * @memberof cc.sys
 * @name LANGUAGE_POLISH
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_POLISH = "pl";

/**
 * Unknown language code
 * @memberof cc.sys
 * @name LANGUAGE_UNKNOWN
 * @constant
 * @type {Number}
 */
sys.LANGUAGE_UNKNOWN = "unkonwn";

/**
 * @memberof cc.sys
 * @name OS_IOS
 * @constant
 * @type {string}
 */
sys.OS_IOS = "iOS";
/**
 * @memberof cc.sys
 * @name OS_ANDROID
 * @constant
 * @type {string}
 */
sys.OS_ANDROID = "Android";
/**
 * @memberof cc.sys
 * @name OS_WINDOWS
 * @constant
 * @type {string}
 */
sys.OS_WINDOWS = "Windows";
/**
 * @memberof cc.sys
 * @name OS_MARMALADE
 * @constant
 * @type {string}
 */
sys.OS_MARMALADE = "Marmalade";
/**
 * @memberof cc.sys
 * @name OS_LINUX
 * @constant
 * @type {string}
 */
sys.OS_LINUX = "Linux";
/**
 * @memberof cc.sys
 * @name OS_BADA
 * @constant
 * @type {string}
 */
sys.OS_BADA = "Bada";
/**
 * @memberof cc.sys
 * @name OS_BLACKBERRY
 * @constant
 * @type {string}
 */
sys.OS_BLACKBERRY = "Blackberry";
/**
 * @memberof cc.sys
 * @name OS_OSX
 * @constant
 * @type {string}
 */
sys.OS_OSX = "OS X";
/**
 * @memberof cc.sys
 * @name OS_WP8
 * @constant
 * @type {string}
 */
sys.OS_WP8 = "WP8";
/**
 * @memberof cc.sys
 * @name OS_WINRT
 * @constant
 * @type {string}
 */
sys.OS_WINRT = "WINRT";
/**
 * @memberof cc.sys
 * @name OS_UNKNOWN
 * @constant
 * @type {string}
 */
sys.OS_UNKNOWN = "Unknown";

/**
 * @memberof cc.sys
 * @name UNKNOWN
 * @constant
 * @default
 * @type {Number}
 */
sys.UNKNOWN = -1;
/**
 * @memberof cc.sys
 * @name WIN32
 * @constant
 * @default
 * @type {Number}
 */
sys.WIN32 = 0;
/**
 * @memberof cc.sys
 * @name LINUX
 * @constant
 * @default
 * @type {Number}
 */
sys.LINUX = 1;
/**
 * @memberof cc.sys
 * @name MACOS
 * @constant
 * @default
 * @type {Number}
 */
sys.MACOS = 2;
/**
 * @memberof cc.sys
 * @name ANDROID
 * @constant
 * @default
 * @type {Number}
 */
sys.ANDROID = 3;
/**
 * @memberof cc.sys
 * @name IOS
 * @constant
 * @default
 * @type {Number}
 */
sys.IPHONE = 4;
/**
 * @memberof cc.sys
 * @name IOS
 * @constant
 * @default
 * @type {Number}
 */
sys.IPAD = 5;
/**
 * @memberof cc.sys
 * @name BLACKBERRY
 * @constant
 * @default
 * @type {Number}
 */
sys.BLACKBERRY = 6;
/**
 * @memberof cc.sys
 * @name NACL
 * @constant
 * @default
 * @type {Number}
 */
sys.NACL = 7;
/**
 * @memberof cc.sys
 * @name EMSCRIPTEN
 * @constant
 * @default
 * @type {Number}
 */
sys.EMSCRIPTEN = 8;
/**
 * @memberof cc.sys
 * @name TIZEN
 * @constant
 * @default
 * @type {Number}
 */
sys.TIZEN = 9;
/**
 * @memberof cc.sys
 * @name WINRT
 * @constant
 * @default
 * @type {Number}
 */
sys.WINRT = 10;
/**
 * @memberof cc.sys
 * @name WP8
 * @constant
 * @default
 * @type {Number}
 */
sys.WP8 = 11;
/**
 * @memberof cc.sys
 * @name MOBILE_BROWSER
 * @constant
 * @default
 * @type {Number}
 */
sys.MOBILE_BROWSER = 100;
/**
 * @memberof cc.sys
 * @name DESKTOP_BROWSER
 * @constant
 * @default
 * @type {Number}
 */
sys.DESKTOP_BROWSER = 101;

/**
 * Indicates whether executes in editor's window process (Electron's renderer context)
 * @memberof cc.sys
 * @name EDITOR_PAGE
 * @constant
 * @default
 * @type {Number}
 */
sys.EDITOR_PAGE = 102;
/**
 * Indicates whether executes in editor's main process (Electron's browser context)
 * @memberof cc.sys
 * @name EDITOR_CORE
 * @constant
 * @default
 * @type {Number}
 */
sys.EDITOR_CORE = 103;

sys.BROWSER_TYPE_WECHAT = "wechat";
sys.BROWSER_TYPE_ANDROID = "androidbrowser";
sys.BROWSER_TYPE_IE = "ie";
sys.BROWSER_TYPE_QQ = "qqbrowser";
sys.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
sys.BROWSER_TYPE_UC = "ucbrowser";
sys.BROWSER_TYPE_360 = "360browser";
sys.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
sys.BROWSER_TYPE_BAIDU = "baidubrowser";
sys.BROWSER_TYPE_MAXTHON = "maxthon";
sys.BROWSER_TYPE_OPERA = "opera";
sys.BROWSER_TYPE_OUPENG = "oupeng";
sys.BROWSER_TYPE_MIUI = "miuibrowser";
sys.BROWSER_TYPE_FIREFOX = "firefox";
sys.BROWSER_TYPE_SAFARI = "safari";
sys.BROWSER_TYPE_CHROME = "chrome";
sys.BROWSER_TYPE_LIEBAO = "liebao";
sys.BROWSER_TYPE_QZONE = "qzone";
sys.BROWSER_TYPE_SOUGOU = "sogou";
sys.BROWSER_TYPE_UNKNOWN = "unknown";

/**
 * Is native ? This is set to be true in jsb auto.
 * @memberof cc.sys
 * @name isNative
 * @type {Boolean}
 */
sys.isNative = false;

/**
 * Is web browser ?
 * @memberof cc.sys
 * @name isBrowser
 * @type {Boolean}
 */
sys.isBrowser = typeof window === 'object' && typeof document === 'object';

if (typeof Editor !== 'undefined' && Editor.isCoreLevel) {
    sys.isMobile = false;
    sys.platform = sys.EDITOR_CORE;
    sys.language = sys.LANGUAGE_UNKNOWN;
    sys.os = ({
        darwin: sys.OS_OSX,
        win32: sys.OS_WINDOWS,
        linux: sys.OS_LINUX
    })[process.platform] || sys.OS_UNKNOWN;
    sys.browserType = null;
    sys.browserVersion = null;
    sys.windowPixelResolution = {
        width: 0,
        height: 0
    };
}
else {
    // browser or runtime
    var win = window, nav = win.navigator, doc = document, docEle = doc.documentElement;
    var ua = nav.userAgent.toLowerCase();

    if (cc.isEditor) {
        sys.isMobile = false;
        sys.platform = sys.EDITOR_PAGE;
    }
    else {
        /**
         * Indicate whether system is mobile system
         * @memberof cc.sys
         * @name isMobile
         * @type {Boolean}
         */
        sys.isMobile = ua.indexOf('mobile') !== -1 || ua.indexOf('android') !== -1;

        /**
         * Indicate the running platform
         * @memberof cc.sys
         * @name platform
         * @type {Number}
         */
        sys.platform = sys.isMobile ? sys.MOBILE_BROWSER : sys.DESKTOP_BROWSER;
    }

    var currLanguage = nav.language;
    currLanguage = currLanguage ? currLanguage : nav.browserLanguage;
    currLanguage = currLanguage ? currLanguage.split("-")[0] : sys.LANGUAGE_ENGLISH;

    /**
     * Indicate the current language of the running system
     * @memberof cc.sys
     * @name language
     * @type {String}
     */
    sys.language = currLanguage;

    // Get the os of system
    var iOS = ( ua.match(/(iPad|iPhone|iPod)/i) ? true : false );
    var isAndroid = ua.match(/android/i) || nav.platform.match(/android/i) ? true : false;
    var osName = sys.OS_UNKNOWN;
    if (nav.appVersion.indexOf("Win") !== -1) osName = sys.OS_WINDOWS;
    else if (iOS) osName = sys.OS_IOS;
    else if (nav.appVersion.indexOf("Mac") !== -1) osName = sys.OS_OSX;
    else if (nav.appVersion.indexOf("X11") !== -1 && nav.appVersion.indexOf("Linux") === -1) osName = sys.OS_UNIX;
    else if (isAndroid) osName = sys.OS_ANDROID;
    else if (nav.appVersion.indexOf("Linux") !== -1) osName = sys.OS_LINUX;

    /**
     * Indicate the running os name
     * @memberof cc.sys
     * @name os
     * @type {String}
     */
    sys.os = osName;

    /**
     * Indicate the running browser type
     * @memberof cc.sys
     * @name browserType
     * @type {String}
     */
    sys.browserType = sys.BROWSER_TYPE_UNKNOWN;
    /* Determine the browser type */
    (function(){
        var typeReg1 = /sogou|qzone|liebao|micromessenger|ucbrowser|360 aphone|360browser|baiduboxapp|baidubrowser|maxthon|mxbrowser|trident|miuibrowser/i;
        var typeReg2 = /qqbrowser|chrome|safari|firefox|opr|oupeng|opera/i;
        var browserTypes = typeReg1.exec(ua);
        if(!browserTypes) browserTypes = typeReg2.exec(ua);
        var browserType = browserTypes ? browserTypes[0] : sys.BROWSER_TYPE_UNKNOWN;
        if (browserType === 'micromessenger')
            browserType = sys.BROWSER_TYPE_WECHAT;
        else if (browserType === "safari" && (ua.match(/android.*applewebkit/)))
            browserType = sys.BROWSER_TYPE_ANDROID;
        else if (browserType === "trident")
            browserType = sys.BROWSER_TYPE_IE;
        else if (browserType === "360 aphone")
            browserType = sys.BROWSER_TYPE_360;
        else if (browserType === "mxbrowser")
            browserType = sys.BROWSER_TYPE_MAXTHON;
        else if (browserType === "opr")
            browserType = sys.BROWSER_TYPE_OPERA;

        sys.browserType = browserType;
    })();

    /**
     * Indicate the running browser version
     * @memberof cc.sys
     * @name browserVersion
     * @type {Number}
     */
    sys.browserVersion = "";
    /* Determine the browser version number */
    (function(){
        var versionReg1 = /(micromessenger|mx|maxthon|baidu|sogou)(mobile)?(browser)?\/?([\d.]+)/i;
        var versionReg2 = /(msie |rv:|firefox|chrome|ucbrowser|qq|oupeng|opera|opr|safari|miui)(mobile)?(browser)?\/?([\d.]+)/i;
        var tmp = ua.match(versionReg1);
        if(!tmp) tmp = ua.match(versionReg2);
        sys.browserVersion = tmp ? tmp[4] : "";
    })();

    var w = window.innerWidth || document.documentElement.clientWidth;
    var h = window.innerHeight || document.documentElement.clientHeight;
    var ratio = window.devicePixelRatio || 1;

    /**
     * Indicate the real pixel resolution of the whole game window
     * @memberof cc.sys
     * @name windowPixelResolution
     * @type {Number}
     */
    sys.windowPixelResolution = {
        width: ratio * w,
        height: ratio * h
    };

    sys._checkWebGLRenderMode = function () {
        if (cc._renderType !== cc.game.RENDER_TYPE_WEBGL)
            throw new Error("This feature supports WebGL render mode only.");
    };

    var _tmpCanvas1 = document.createElement("canvas"),
        _tmpCanvas2 = document.createElement("canvas");

    cc.create3DContext = function (canvas, opt_attribs) {
        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        var context = null;
        for (var ii = 0; ii < names.length; ++ii) {
            try {
                context = canvas.getContext(names[ii], opt_attribs);
            } catch (e) {
            }
            if (context) {
                break;
            }
        }
        return context;
    };

    //Whether or not the Canvas BlendModes are supported.
    sys._supportCanvasNewBlendModes = (function(){
        var canvas = _tmpCanvas1;
        canvas.width = 1;
        canvas.height = 1;
        var context = canvas.getContext('2d');
        context.fillStyle = '#000';
        context.fillRect(0,0,1,1);
        context.globalCompositeOperation = 'multiply';

        var canvas2 = _tmpCanvas2;
        canvas2.width = 1;
        canvas2.height = 1;
        var context2 = canvas2.getContext('2d');
        context2.fillStyle = '#fff';
        context2.fillRect(0,0,1,1);
        context.drawImage(canvas2, 0, 0, 1, 1);

        return context.getImageData(0,0,1,1).data[0] === 0;
    })();

    // Adjust mobile css settings
    if (cc.sys.isMobile) {
        var fontStyle = document.createElement("style");
        fontStyle.type = "text/css";
        document.body.appendChild(fontStyle);

        fontStyle.textContent = "body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;"
                                + "-webkit-tap-highlight-color:rgba(0,0,0,0);}";
    }

    /**
     * cc.sys.localStorage is a local storage component.
     * @memberof cc.sys
     * @name localStorage
     * @type {Object}
     */
    try {
        var localStorage = sys.localStorage = win.localStorage;
        localStorage.setItem("storage", "");
        localStorage.removeItem("storage");
        localStorage = null;
    } catch (e) {
        var warn = function () {
            cc.warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option");
        };
        sys.localStorage = {
            getItem : warn,
            setItem : warn,
            removeItem : warn,
            clear : warn
        };
    }

    var _supportCanvas = !!_tmpCanvas1.getContext("2d");
    var _supportWebGL = false;
    var tmpCanvas = document.createElement("CANVAS");
    if (win.WebGLRenderingContext) {
        try{
            var context = cc.create3DContext(tmpCanvas, {'stencil': true, 'preserveDrawingBuffer': true });
            if(context) {
                _supportWebGL = true;
            }
        }
        catch (e) {}
    }

    /**
     * The capabilities of the current platform
     * @memberof cc.sys
     * @name capabilities
     * @type {Object}
     */
    var capabilities = sys.capabilities = {
        "canvas": _supportCanvas,
        "opengl": _supportWebGL
    };
    if (docEle['ontouchstart'] !== undefined || doc['ontouchstart'] !== undefined || nav.msPointerEnabled)
        capabilities["touches"] = true;
    if (docEle['onmouseup'] !== undefined)
        capabilities["mouse"] = true;
    if (docEle['onkeyup'] !== undefined)
        capabilities["keyboard"] = true;
    if (win.DeviceMotionEvent || win.DeviceOrientationEvent)
        capabilities["accelerometer"] = true;

    delete _tmpCanvas1;
    delete _tmpCanvas2;
}

/**
 * Forces the garbage collection, only available in JSB
 * @memberof cc.sys
 * @name garbageCollect
 * @function
 */
sys.garbageCollect = function () {
    // N/A in cocos2d-html5
};

/**
 * Dumps rooted objects, only available in JSB
 * @memberof cc.sys
 * @name dumpRoot
 * @function
 */
sys.dumpRoot = function () {
    // N/A in cocos2d-html5
};

/**
 * Restart the JS VM, only available in JSB
 * @memberof cc.sys
 * @name restartVM
 * @function
 */
sys.restartVM = function () {
    // N/A in cocos2d-html5
};

/**
 * Clean a script in the JS VM, only available in JSB
 * @memberof cc.sys
 * @name cleanScript
 * @param {String} jsfile
 * @function
 */
sys.cleanScript = function (jsfile) {
    // N/A in cocos2d-html5
};

/**
 * Check whether an object is valid,
 * In web engine, it will return true if the object exist
 * In native engine, it will return true if the JS object and the correspond native object are both valid
 * @memberof cc.sys
 * @name isObjectValid
 * @param {Object} obj
 * @return {boolean} Validity of the object
 * @function
 */
sys.isObjectValid = function (obj) {
    if (obj) return true;
    else return false;
};

/**
 * Dump system informations
 * @memberof cc.sys
 * @name dump
 * @function
 */
sys.dump = function () {
    var self = this;
    var str = "";
    str += "isMobile : " + self.isMobile + "\r\n";
    str += "language : " + self.language + "\r\n";
    str += "browserType : " + self.browserType + "\r\n";
    str += "capabilities : " + JSON.stringify(self.capabilities) + "\r\n";
    str += "os : " + self.os + "\r\n";
    str += "platform : " + self.platform + "\r\n";
    cc.log(str);
};

/**
 * Open a url in browser
 * @memberof cc.sys
 * @name openURL
 * @param {String} url
 */
sys.openURL = function(url){
    window.open(url);
};

module.exports = sys;