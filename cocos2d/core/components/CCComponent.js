require('../platform/CCObject');
require('../CCNode');

var Flags = cc.Object.Flags;
var IsOnEnableCalled = Flags.IsOnEnableCalled;
var IsOnLoadCalled = Flags.IsOnLoadCalled;
var IsOnStartCalled = Flags.IsOnStartCalled;

// TEMP
cc.ENode.prototype._activeInHierarchy = true;
cc.ENode.prototype.activeInHierarchy = true;
cc.ENode.prototype.uuid = '(TODO)';
cc.ENode.prototype._components = [];


if (CC_EDITOR) {
    var ExecInTryCatchTmpl = '(function call_FUNC_InTryCatch(c){try{c._FUNC_()}catch(e){cc._throw(e)}})';
    var callOnEnableInTryCatch = eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onEnable'));
    var callOnDisableInTryCatch = eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onDisable'));
    var callOnLoadInTryCatch = eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onLoad'));
    var callStartInTryCatch = eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'start'));
    var callOnDestroyInTryCatch = eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onDestroy'));
    var callOnFocusInTryCatch = eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onFocusInEditMode'));
    var callOnLostFocusInTryCatch = eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onLostFocusInEditMode'));
}

function callOnEnable (self, enable) {
    //if (CC_EDITOR) {
    //    if (enable ) {
    //        if ( !(self._objFlags & IsEditorOnEnabledCalled) ) {
    //            editorCallback.onComponentEnabled(self);
    //            self._objFlags |= IsEditorOnEnabledCalled;
    //        }
    //    }
    //    else {
    //        if (self._objFlags & IsEditorOnEnabledCalled) {
    //            editorCallback.onComponentDisabled(self);
    //            self._objFlags &= ~IsEditorOnEnabledCalled;
    //        }
    //    }
    //    if ( !(cc.game.isPlaying || self.constructor._executeInEditMode) ) {
    //        return;
    //    }
    //}
    var enableCalled = self._objFlags & IsOnEnableCalled;
    if (enable) {
        if (!enableCalled) {
            if (self.onEnable) {
                if (CC_EDITOR) {
                    callOnEnableInTryCatch(self);
                }
                else {
                    self.onEnable();
                }
                self.update && cc.director.on(cc.Director.EVENT_COMPONENT_UPDATE, _callUpdate, self);
                self.lateUpdate && cc.director.on(cc.Director.EVENT_COMPONENT_LATE_UPDATE, _callLateUpdate, self);
            }
            self._objFlags |= IsOnEnableCalled;
        }
    }
    else {
        if (enableCalled) {
            if (self.onDisable) {
                if (CC_EDITOR) {
                    callOnDisableInTryCatch(self);
                }
                else {
                    self.onDisable();
                }
                self.update && cc.director.off(cc.Director.EVENT_COMPONENT_UPDATE, _callUpdate, self);
                self.lateUpdate && cc.director.off(cc.Director.EVENT_COMPONENT_LATE_UPDATE, _callLateUpdate, self);
            }
            self._objFlags &= ~IsOnEnableCalled;
        }
    }
}

var _callStart = CC_EDITOR ? function () {
    var isPlaying = cc.engine.isPlaying;
    if (!(this._objFlags & IsOnStartCalled) && (isPlaying || this.constructor._executeInEditMode)) {
        if (this.start) {
            callStartInTryCatch(this);
        }
        this._objFlags |= IsOnStartCalled;
    }
} : function () {
    if (!(this._objFlags & IsOnStartCalled)) {
        if (this.start) {
            this.start();
        }
        this._objFlags |= IsOnStartCalled;
    }
};
var _callUpdate = CC_EDITOR ? function (dt) {
    var isPlaying = cc.engine.isPlaying;
    if ((isPlaying || this.constructor._executeInEditMode) && this.update) {
        try {
            this.update(dt);
        }
        catch (e) {
            cc._throw(e);
        }
    }
} : function (dt) {
    this.update && this.update(dt);
};
var _callLateUpdate = CC_EDITOR ? function (dt) {
    var isPlaying = cc.engine.isPlaying;
    if ((isPlaying || this.constructor._executeInEditMode) && this.lateUpdate) {
        try {
            this.lateUpdate(dt);
        }
        catch (e) {
            cc._throw(e);
        }
    }
} : function (dt) {
    this.lateUpdate && this.lateUpdate(dt);
};

//var createInvoker = function (timerFunc, timerWithKeyFunc, errorInfo) {
//    return function (functionOrMethodName, time) {
//        var ms = (time || 0) * 1000;
//        var self = this;
//        if (typeof functionOrMethodName === "function") {
//            return timerFunc(function () {
//                if (self.isValid) {
//                    functionOrMethodName.call(self);
//                }
//            }, ms);
//        }
//        else {
//            var method = this[functionOrMethodName];
//            if (typeof method === 'function') {
//                var key = this.id + '.' + functionOrMethodName;
//                timerWithKeyFunc(function () {
//                    if (self.isValid) {
//                        method.call(self);
//                    }
//                }, ms, key);
//            }
//            else {
//                cc.error('Can not %s %s.%s because it is not a valid function.', errorInfo, JS.getClassName(this), functionOrMethodName);
//            }
//        }
//    };
//};

// Yes, the id might have a conflict problem once every 365 days
// if the game runs at 60 FPS and each frame 4760273 counts of new HashObject's id are requested.
var CompId = 0;
var IdPrefix = (CC_EDITOR || CC_TEST) && ('Comp' + Editor.NonUuidMark);
var getNewId = (CC_EDITOR || CC_TEST) && function () {
    return IdPrefix + (++CompId);
};

/**
 * Base class for everything attached to Node(Entity).
 *
 * NOTE: Not allowed to use construction parameters for Component's subclasses,
 *       because Component is created by the engine.
 *
 * @class Component
 * @extends cc.Object
 * @constructor
 */
var Component = cc.Class({
    name: 'cc.Component',
    extends: cc.Object,

    ctor: (CC_EDITOR || CC_TEST) && function () {
        //// 我们并不在构造函数中给 entity 赋值，因为那样到了反序列化时，子类的构造函数就还是会拿不到 entity。
        //Editor._AssetsWatcher.initComponent(this);

        // dont reset _id when destroyed
        Object.defineProperty(this, '_id', {
            value: '',
            enumerable: false
        });
    },

    properties: {
        /**
         * The node this component is attached to. A component is always attached to a node.
         * @property node
         * @type {cc.Node}
         */
        node: {
            default: null,
            visible: false
        },

        _id: {
            default: '',
            serializable: false
        },

        /**
         * The uuid for editor
         * @type {String}
         * @readOnly
         */
        uuid: {
            get: function () {
                var existsId = this._id;
                if (existsId) {
                    return existsId;
                }
                if (CC_EDITOR || CC_TEST) {
                    this._id = getNewId();
                    cc.engine.attachedObjsForEditor[this._id] = this;
                    return this._id;
                }
            },
            visible: false
        },

        __scriptAsset: CC_EDITOR && {
            get: function () {
                return this.__scriptUuid && Editor.serialize.asAsset(this.__scriptUuid);
            },
            set: function (value) {
                if (this.__scriptUuid !== value) {
                    if (value && Editor.isUuid(value._uuid)) {
                        var classId = Editor.compressUuid(value._uuid);
                        var newComp = cc.js._getClassById(classId);
                        if (newComp) {
                            cc.warn('Sorry, replacing component script is not yet implemented.');
                            //Editor.sendToWindows('reload:window-scripts', Editor._Sandbox.compiled);
                        }
                        else {
                            cc.error('Can not find a component in the script which uuid is "%s".', value._uuid);
                        }
                    }
                    else {
                        cc.error('Invalid Script');
                    }
                }
            },
            displayName: 'Script',
            type: cc.JavaScript,
            visible: true
        },

        /**
         * @property _enabled
         * @type boolean
         * @private
         */
        _enabled: true,

        /**
         * indicates whether this component is enabled or not.
         * @property enabled
         * @type boolean
         * @default true
         */
        enabled: {
            get: function () {
                return this._enabled;
            },
            set: function (value) {
                if (this._enabled !== value) {
                    this._enabled = value;
                    if (this.node._activeInHierarchy) {
                        callOnEnable(this, value);
                    }
                }
            },
            visible: false
        },

        /**
         * indicates whether this component is enabled and its entity is also active in the hierarchy.
         * @property enabledInHierarchy
         * @type {boolean}
         * @readOnly
         */
        enabledInHierarchy: {
            get: function () {
                return this._enabled && this.node._activeInHierarchy;
            },
            visible: false
        },

        /**
         * @property _isOnLoadCalled
         * @type {boolean}
         * @readOnly
         */
        _isOnLoadCalled: {
            get: function () {
                return this._objFlags & IsOnLoadCalled;
            },
            visible: false
        },

        /**
         * Register all related EventTargets, 
         * all event callbacks will be removed in _onPreDestroy
         * @property __eventTargets
         * @type array
         * @private
         */
        __eventTargets: {
            default: [],
            serializable: false
        }
    },

    // LIFECYCLE METHODS

    // Fireball provides lifecycle methods that you can specify to hook into this process.
    // We provide Pre methods, which are called right before something happens, and Post methods which are called right after something happens.

    /**
     * Update is called every frame, if the Component is enabled.
     * @method update
     */
    update: null,

    /**
     * LateUpdate is called every frame, if the Component is enabled.
     * @method lateUpdate
     */
    lateUpdate: null,

    /**
     * When attaching to an active entity or its entity first activated
     * @method onLoad
     */
    onLoad: null,

    /**
     * Called before all scripts' update if the Component is enabled
     * @method start
     */
    start: null,

    /**
     * Called when this component becomes enabled and its entity becomes active
     * @method onEnable
     */
    onEnable: null,

    /**
     * Called when this component becomes disabled or its entity becomes inactive
     * @method onDisable
     */
    onDisable: null,

    /**
     * Called when this component will be destroyed.
     * @method onDestroy
     */
    onDestroy: null,

    ///**
    // * Called when the engine starts rendering the scene.
    // * @method onPreRender
    // */
    //onPreRender: null,

    /**
     * @method onFocusInEditMode
     */
    onFocusInEditMode: null,
    /**
     * @method onLostFocusInEditMode
     */
    onLostFocusInEditMode: null,

    /**
     * Adds a component class to the entity. You can also add component to entity by passing in the name of the
     * script.
     *
     * @method addComponent
     * @param {function|string} typeOrName - the constructor or the class name of the component to add
     * @return {Component} - the newly added component
     */
    addComponent: function (typeOrTypename) {
        return this.node.addComponent(typeOrTypename);
    },

    /**
     * Returns the component of supplied type if the entity has one attached, null if it doesn't. You can also get
     * component in the entity by passing in the name of the script.
     *
     * @method getComponent
     * @param {function|string} typeOrName
     * @return {Component}
     */
    getComponent: function (typeOrTypename) {
        return this.node.getComponent(typeOrTypename);
    },

    ///**
    // * Invokes the method on this component after a specified delay.
    // * The method will be invoked even if this component is disabled, but will not invoked if this component is
    // * destroyed.
    // *
    // * @method invoke
    // * @param {function|string} functionOrMethodName
    // * @param {number} [delay=0] - The number of seconds that the function call should be delayed by. If omitted, it defaults to 0. The actual delay may be longer.
    // * @return {number} - Will returns a new InvokeID if the functionOrMethodName is type function. InvokeID is the numerical ID of the invoke, which can be used later with cancelInvoke().
    // * @example {@link examples/Fire/Component/invoke.js }
    // */
    //invoke: createInvoker(Timer.setTimeout, Timer.setTimeoutWithKey, 'invoke'),
    //
    ///**
    // * Invokes the method on this component repeatedly, with a fixed time delay between each call.
    // * The method will be invoked even if this component is disabled, but will not invoked if this component is
    // * destroyed.
    // *
    // * @method repeat
    // * @param {function|string} functionOrMethodName
    // * @param {number} [delay=0] - The number of seconds that the function call should wait before each call to the method. If omitted, it defaults to 0. The actual delay may be longer.
    // * @return {number} - Will returns a new RepeatID if the method is type function. RepeatID is the numerical ID of the repeat, which can be used later with cancelRepeat().
    // * @example {@link examples/Fire/Component/repeat.js}
    // */
    //repeat: createInvoker(Timer.setInterval, Timer.setIntervalWithKey, 'repeat'),
    //
    ///**
    // * Cancels previous invoke calls with methodName or InvokeID on this component.
    // * When using methodName, all calls with the same methodName will be canceled.
    // * InvokeID is the identifier of the invoke action you want to cancel, as returned by invoke().
    // *
    // * @method cancelInvoke
    // * @param {string|number} methodNameOrInvokeId
    // * @example {@link examples/Fire/Component/cancelInvoke.js}
    // */
    //cancelInvoke: function (methodNameOrInvokeId) {
    //    if (typeof methodNameOrInvokeId === 'string') {
    //        var key = this.id + '.' + methodNameOrInvokeId;
    //        Timer.clearTimeoutByKey(key);
    //    }
    //    else {
    //        Timer.clearTimeout(methodNameOrInvokeId);
    //    }
    //},
    //
    ///**
    // * Cancels previous repeat calls with methodName or RepeatID on this component.
    // * When using methodName, all calls with the same methodName will be canceled.
    // * RepeatID is the identifier of the repeat action you want to cancel, as returned by repeat().
    // *
    // * @method cancelRepeat
    // * @param {string|number} methodNameOrRepeatId
    // * @example {@link examples/Fire/Component/cancelRepeat.js}
    // */
    //cancelRepeat: function (methodNameOrRepeatId) {
    //    if (typeof methodNameOrRepeatId === 'string') {
    //        var key = this.id + '.' + methodNameOrRepeatId;
    //        Timer.clearIntervalByKey(key);
    //    }
    //    else {
    //        Timer.clearInterval(methodNameOrRepeatId);
    //    }
    //},
    //
    //isInvoking: function (methodName) {
    //    var key = this.id + '.' + methodName;
    //    return Timer.hasTimeoutKey(key);
    //},

    // OVERRIDES

    destroy: function () {
        if (this._super()) {
            if (this._enabled && this.node._activeInHierarchy) {
                callOnEnable(this, false);
            }
        }
    },

    __onNodeActivated: CC_EDITOR ? function (active) {
        if (!(this._objFlags & IsOnLoadCalled) &&
            (cc.engine.isPlaying || this.constructor._executeInEditMode)) {
            if (this.onLoad) {
                callOnLoadInTryCatch(this);
                this._objFlags |= IsOnLoadCalled;

                if (!cc.engine.isPlaying) {
                    var focused = Editor.Selection.curActivate('node') === this.node.uuid;
                    if (focused && this.onFocusInEditMode) {
                        callOnFocusInTryCatch(this);
                    }
                    else if (this.onLostFocusInEditMode) {
                        callOnLostFocusInTryCatch(this);
                    }
                }
            }
            else {
                this._objFlags |= IsOnLoadCalled;
            }

            if (this.start)
                cc.director.once(cc.Director.EVENT_BEFORE_UPDATE, _callStart, this);
            if (this.update)
                cc.director.on(cc.Director.EVENT_COMPONENT_UPDATE, _callUpdate, this);
            if (this.lateUpdate)
                cc.director.on(cc.Director.EVENT_COMPONENT_LATE_UPDATE, _callLateUpdate, this);
            //Editor._AssetsWatcher.start(this);
        }

        if (this._enabled) {
            callOnEnable(this, active);
        }
    } : function (active) {
        if (!(this._objFlags & IsOnLoadCalled)) {
            if (this.onLoad) {
                this.onLoad();
            }
            this._objFlags |= IsOnLoadCalled;

            if (this.start)
                cc.director.once(cc.Director.EVENT_BEFORE_UPDATE, _callStart, this);
            if (this.update)
                cc.director.on(cc.Director.EVENT_COMPONENT_UPDATE, _callUpdate, this);
            if (this.lateUpdate)
                cc.director.on(cc.Director.EVENT_COMPONENT_LATE_UPDATE, _callLateUpdate, this);
        }

        if (this._enabled) {
            callOnEnable(this, active);
        }
    },

    statics: {
        _executeInEditMode: false,

        // This property is only available if _executeInEditMode is true.
        // If true, the engine will keep updating this node in 60 fps when it is selected,
        // otherwise, it will update only if necessary
        _60fpsInEditMode: false,
    },

    __scriptUuid: '',

    _onPreDestroy: function () {
        var i, l, target;
        // ensure onDisable called
        callOnEnable(this, false);
        // Remove all listeners
        for (i = 0, l = this.__eventTargets.length; i < l; ++i) {
            target = this.__eventTargets[i];
            target && target.targetOff && target.targetOff(this);
        }
        this.__eventTargets.length = 0;
        // onDestroy
        if (CC_EDITOR) {
            //Editor._AssetsWatcher.stop(this);
            if (cc.engine.isPlaying || this.constructor._executeInEditMode) {
                if (this.onDestroy) {
                    callOnDestroyInTryCatch(this);
                }
            }
        }
        else if (this.onDestroy) {
            this.onDestroy();
        }
        // do remove component
        this.node._removeComponent(this);

        if (CC_EDITOR || CC_TEST) {
            delete cc.engine.attachedObjsForEditor[this._id];
        }
    }
});

cc.Component = module.exports = Component;

// COMPONENT HELPERS

if (CC_EDITOR) {
    cc._componentMenuItems = [];
}

/**
 * Register a component to the editors "Component" menu.
 *
 * @param {function} constructor - the class you want to register, must inherit from Component
 * @param {string} menuPath - the menu path name. Eg. "Rendering/Camera"
 * @param {number} [priority] - the order which the menu item are displayed
 */
cc.addComponentMenu = function (constructor, menuPath, priority) {
    if (CC_EDITOR) {
        if ( !cc.isChildClassOf(constructor, Component) ) {
            cc.error('cc.addComponentMenu: constructor must inherit from Component');
            return;
        }
        cc._componentMenuItems.push({
            component: constructor,
            menuPath: menuPath,
            priority: priority
        });
    }
};

/**
 * Makes a component execute in edit mode.
 * By default, all components are only executed in play mode,
 * which means they will not have their callback functions executed while the Editor is in edit mode.
 * By calling this function, each component will also have its callback executed in edit mode.
 *
 * @method executeInEditMode
 * @param {Component} constructor - The class you want to register, must inherit from Component.
 * @param {boolean} [prefer60FPS=false] - If true, the scene view will keep updating this entity in 60 fps when it is selected,
 *                         otherwise, it will update only if necessary.
 */
cc.executeInEditMode = function (constructor, prefer60FPS) {
    if (CC_EDITOR || CC_TEST) {
        if ( !cc.isChildClassOf(constructor, Component) ) {
            cc.error('[cc.executeInEditMode] constructor must inherit from Component');
            return;
        }
        constructor._executeInEditMode = true;
        constructor._60fpsInEditMode = !!prefer60FPS;
    }
};
