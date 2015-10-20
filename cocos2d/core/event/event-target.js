var EventListeners = require('./event-listeners');
var Event = require('./event');
var EventCustom = Event.EventCustom;
var JS = cc.js;

var cachedArray = new Array(16);
cachedArray.length = 0;

var _doDispatchEvent = function (event) {
    event.target = this;

    // Event.CAPTURING_PHASE
    this._getCapturingTargets(event.type, cachedArray);
    // propagate
    event.eventPhase = 1;
    var target, i;
    for (i = cachedArray.length - 1; i >= 0; --i) {
        target = cachedArray[i];
        if (target._isTargetActive() && target._capturingListeners) {
            event.currentTarget = target;
            // fire event
            target._capturingListeners.invoke.apply(target._capturingListeners, arguments);
            // check if propagation stopped
            if (event._propagationStopped) {
                return;
            }
        }
    }
    cachedArray.length = 0;

    // Event.AT_TARGET
    // checks if destroyed in capturing callbacks
    if (this._isTargetActive()) {
        _doSendEvent.call(this, event);
        if (event._propagationStopped) {
            return;
        }
    }

    if (event.bubbles) {
        // Event.BUBBLING_PHASE
        this._getBubblingTargets(event.type, cachedArray);
        // propagate
        event.eventPhase = 3;
        for (i = 0; i < cachedArray.length; ++i) {
            target = cachedArray[i];
            if (target._isTargetActive() && target._bubblingListeners) {
                event.currentTarget = target;
                // fire event
                target._bubblingListeners.invoke(event);
                // check if propagation stopped
                if (event._propagationStopped) {
                    return;
                }
            }
        }
    }
    cachedArray.length = 0;
};


var _doSendEvent = function (event) {
    // Event.AT_TARGET
    event.eventPhase = 2;
    event.currentTarget = this;
    if (this._capturingListeners) {
        this._capturingListeners.invoke(event);
        if (event._propagationStopped) {
            return;
        }
    }
    if (this._bubblingListeners) {
        this._bubblingListeners.invoke(event);
    }
};

/**
 * EventTarget is an object to which an event is dispatched when something has occurred.
 * Entity are the most common event targets, but other objects can be event targets too.
 *
 * Event targets are an important part of the Fireball event model.
 * The event target serves as the focal point for how events flow through the scene graph.
 * When an event such as a mouse click or a keypress occurs, Fireball dispatches an event object
 * into the event flow from the root of the hierarchy. The event object then makes its way through
 * the scene graph until it reaches the event target, at which point it begins its return trip through
 * the scene graph. This round-trip journey to the event target is conceptually divided into three phases:
 * - The capture phase comprises the journey from the root to the last node before the event target's node
 * - The target phase comprises only the event target node
 * - The bubbling phase comprises any subsequent nodes encountered on the return trip to the root of the tree
 * See also: http://www.w3.org/TR/DOM-Level-3-Events/#event-flow
 *
 * Event targets can implement the following methods:
 *  - _getCapturingTargets
 *  - _getBubblingTargets
 *
 * @class EventTarget
 */
var EventTarget = function () {
}

JS.mixin(EventTarget.prototype, {
    /**
     * @property _capturingListeners
     * @type {EventListeners}
     * @default null
     * @private
     */
    _capturingListeners: null,

    /**
     * @property _bubblingListeners
     * @type {EventListeners}
     * @default null
     * @private
     */
    _bubblingListeners: null,

    /**
     * Checks whether the EventTarget object has any callback registered for a specific type of event.
     *
     * @param {string} type - The type of event.
     * @param {Boolean} A value of true if a callback of the specified type is registered; false otherwise.
     */
    hasEventListener: function (type) {
        return this._bubblingListeners.has(type) || this._capturingListeners.has(type);
    },

    /**
     * Register an callback of a specific event type on the EventTarget.
     * This method is merely an alias to addEventListener.
     *
     * @method on
     * @param {string} type - A string representing the event type to listen for.
     * @param {function} callback - The callback that will be invoked when the event is dispatched.
     *                              The callback is ignored if it is a duplicate (the callbacks are unique).
     * @param {Event} callback.param event
     * @param {Boolean} [useCapture=false] - When set to true, the capture argument prevents callback
     *                              from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE.
     *                              When false, callback will NOT be invoked when event's eventPhase attribute value is CAPTURING_PHASE.
     *                              Either way, callback will be invoked when event's eventPhase attribute value is AT_TARGET.
     */
    on: function (type, callback, useCapture) {
        useCapture = typeof useCapture !== "undefined" ? useCapture : false;
        if (!callback) {
            cc.error('Callback of event must be non-nil');
            return;
        }
        var listeners = null;
        if (useCapture) {
            listeners = this._capturingListeners = this._capturingListeners || new EventListeners();
        }
        else {
            listeners = this._bubblingListeners = this._bubblingListeners || new EventListeners();
        }
        if ( ! listeners.has(type, callback) ) {
            listeners.add(type, callback);
        }
    },

    /**
     * Removes the callback previously registered with the same type, callback, and capture.
     * This method is merely an alias to removeEventListener.
     *
     * @method off
     * @param {string} type - A string representing the event type being removed.
     * @param {function} callback - The callback to remove.
     * @param {Boolean} [useCapture=false] - Specifies whether the callback being removed was registered as a capturing callback or not.
     *                              If not specified, useCapture defaults to false. If a callback was registered twice,
     *                              one with capture and one without, each must be removed separately. Removal of a capturing callback
     *                              does not affect a non-capturing version of the same listener, and vice versa.
     */
    off: function (type, callback, useCapture) {
        useCapture = typeof useCapture !== "undefined" ? useCapture : false;
        if (!callback) {
            return;
        }
        var listeners = useCapture ? this._capturingListeners : this._bubblingListeners;
        if (listeners) {
            listeners.remove(type, callback);
        }
    },

    /**
     * Register an callback of a specific event type on the EventTarget, the callback will remove itself after the first time it is triggered.
     *
     * @method once
     * @param {string} type - A string representing the event type to listen for.
     * @param {function} callback - The callback that will be invoked when the event is dispatched.
     *                              The callback is ignored if it is a duplicate (the callbacks are unique).
     * @param {Event} callback.param event
     * @param {Boolean} [useCapture=false] - When set to true, the capture argument prevents callback
     *                              from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE.
     *                              When false, callback will NOT be invoked when event's eventPhase attribute value is CAPTURING_PHASE.
     *                              Either way, callback will be invoked when event's eventPhase attribute value is AT_TARGET.
     */
    once: function (type, callback, useCapture) {
        var self = this;
        var cb = function (event) {
            self.off(type, cb, useCapture);
            callback(event);
        };
        this.on(type, cb, useCapture);
    },

    /**
     * Dispatches an event into the event flow. The event target is the EventTarget object upon which the dispatchEvent() method is called.
     *
     * @method dispatchEvent
     * @param {Event} event - The Event object that is dispatched into the event flow
     * @return {Boolean} - returns true if either the event's preventDefault() method was not invoked,
     *                      or its cancelable attribute value is false, and false otherwise.
     */
    dispatchEvent: function (event) {
        _doDispatchEvent.apply(this, arguments);
        cachedArray.length = 0;
        var notPrevented = ! event._defaultPrevented;
        event.unuse();
        return notPrevented;
    },

    /**
     * Send an event to this object directly, this method will not propagate the event to any other objects.
     * The event will be created from the supplied message, you can get the "detail" argument from event.detail.
     *
     * @method emit
     * @param {string} message - the message to send
     * @param {any} [detail] - whatever argument the message needs
     */
    emit: function (message, detail) {
        if ( typeof message === 'string' ) {
            var event = new EventCustom(message);
            event.detail = detail;
            _doSendEvent.call(this, event);
        }
        else {
            cc.error('The message must be provided');
        }
    },

    /**
     * Get whether the target is active for events.
     * The name is for avoiding conflict with user defined functions.
     *
     * Subclasses can override this method to make event target active or inactive.
     * @method _isTargetActive
     * @param {string} type - the event type
     * @return {boolean} - A boolean value indicates the event target is active or not
     */
    _isTargetActive: function (type) {
        return true;
    },

    /**
     * Get all the targets listening to the supplied type of event in the target's capturing phase.
     * The capturing phase comprises the journey from the root to the last node BEFORE the event target's node.
     * The result should save in the array parameter, and MUST SORT from child nodes to parent nodes.
     *
     * Subclasses can override this method to make event propagable.
     * @method _getCapturingTargets
     * @param {string} type - the event type
     * @param {array} array - the array to receive targets
     * @example
     * Subclasses can override this method to make event propagable
     * ```js
     * for (var target = this._parent; target; target = target._parent) {
     *     if (target._capturingListeners && target._capturingListeners.has(type)) {
     *         array.push(target);
     *     }
     * }
     * ```
     */
    _getCapturingTargets: function (type, array) {

    },

    /**
     * Get all the targets listening to the supplied type of event in the target's bubbling phase.
     * The bubbling phase comprises any SUBSEQUENT nodes encountered on the return trip to the root of the tree.
     * The result should save in the array parameter, and MUST SORT from child nodes to parent nodes.
     *
     * Subclasses can override this method to make event propagable.
     * @method _getBubblingTargets
     * @param {string} type - the event type
     * @param {array} array - the array to receive targets
     */
    _getBubblingTargets: function (type, array) {
        // Object can override this method to make event propagable.
    }
});

/**
 * Polyfill the functionalities of EventTarget into a existing object
 * @static
 * @memberof EventTarget
 * @param {Object} object - An object to be extended with EventTarget capability
 */
EventTarget.polyfill = function (object) {
    var proto = EventTarget.prototype;
    // Can't use cc.js.mixin because we don't want to inject polyfill or overwrite _getXXXTargets
    object._capturingListeners = null;
    object._bubblingListeners = null;

    object.hasEventListener = proto.hasEventListener;
    object.on = proto.on;
    object.off = proto.off;
    object.once = proto.once;
    object.dispatchEvent = proto.dispatchEvent;
    object.emit = proto.emit;
    if (!object._isTargetActive)
        object._isTargetActive = proto._isTargetActive;
    if (!object._getCapturingTargets)
        object._getCapturingTargets = proto._getCapturingTargets;
    if (!object._getBubblingTargets)
        object._getBubblingTargets = proto._getBubblingTargets;
}

cc.EventTarget = module.exports = EventTarget;
