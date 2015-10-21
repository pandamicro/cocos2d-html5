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

var JS = cc.js;

/**
 * The type code of Touch event.
 * @constant
 * @type {string}
 */
cc.Event.TOUCH = 'touch';
/**
 * The type code of Mouse event.
 * @constant
 * @type {string}
 */
cc.Event.MOUSE = 'mouse';
/**
 * The type code of UI focus event.
 * @constant
 * @type {string}
 */
cc.Event.FOCUS = 'focus';
/**
 * The type code of Keyboard event.
 * @constant
 * @memberof cc.Event
 * @type {string}
 */
cc.Event.KEYBOARD = 'keyboard';
/**
 * The type code of Acceleration event.
 * @constant
 * @memberof cc.Event
 * @type {string}
 */
cc.Event.ACCELERATION = 'acceleration';

/**
 * The mouse event
 * @class cc.Event.EventMouse
 * @constructor
 * @extends cc.Event
 * @param {number} eventType - The mouse event type, UP, DOWN, MOVE, CANCELED
 * @param {boolean} [bubbles=false] - A boolean indicating whether the event bubbles up through the tree or not
 */
var EventMouse = function (eventType, bubbles) {
    cc.Event.call(this, cc.Event.MOUSE, bubbles);
    this._eventType = eventType;
    this._button = 0;
    this._x = 0;
    this._y = 0;
    this._prevX = 0;
    this._prevY = 0;
    this._scrollX = 0;
    this._scrollY = 0;
};

JS.extend(EventMouse, cc.Event);
JS.mixin(EventMouse.prototype, {
    /**
     * Sets scroll data
     * @param {number} scrollX
     * @param {number} scrollY
     */
    setScrollData: function (scrollX, scrollY) {
        this._scrollX = scrollX;
        this._scrollY = scrollY;
    },

    /**
     * Returns the x axis scroll value
     * @returns {number}
     */
    getScrollX: function () {
        return this._scrollX;
    },

    /**
     * Returns the y axis scroll value
     * @returns {number}
     */
    getScrollY: function () {
        return this._scrollY;
    },

    /**
     * Sets cursor location
     * @param {number} x
     * @param {number} y
     */
    setLocation: function (x, y) {
        this._x = x;
        this._y = y;
    },

	/**
	 * Returns cursor location
	 * @return {cc.Vec2} location
	 */
    getLocation: function () {
        return {x: this._x, y: this._y};
    },

	/**
	 * Returns the current cursor location in screen coordinates
	 * @return {cc.Vec2}
	 */
	getLocationInView: function() {
		return {x: this._x, y: cc.view._designResolutionSize.height - this._y};
	},

    _setPrevCursor: function (x, y) {
        this._prevX = x;
        this._prevY = y;
    },

    /**
     * Returns the delta distance from the previous location to current location
     * @return {cc.Vec2}
     */
    getDelta: function () {
        return {x: this._x - this._prevX, y: this._y - this._prevY};
    },

    /**
     * Returns the X axis delta distance from the previous location to current location
     * @return {Number}
     */
    getDeltaX: function () {
        return this._x - this._prevX;
    },

    /**
     * Returns the Y axis delta distance from the previous location to current location
     * @return {Number}
     */
    getDeltaY: function () {
        return this._y - this._prevY;
    },

    /**
     * Sets mouse button
     * @param {number} button
     */
    setButton: function (button) {
        this._button = button;
    },

    /**
     * Returns mouse button
     * @returns {number}
     */
    getButton: function () {
        return this._button;
    },

    /**
     * Returns location X axis data
     * @returns {number}
     */
    getLocationX: function () {
        return this._x;
    },

    /**
     * Returns location Y axis data
     * @returns {number}
     */
    getLocationY: function () {
        return this._y;
    }
});

//Inner event types of MouseEvent
/**
 * The none event code of mouse event.
 * @constant
 * @type {number}
 */
EventMouse.NONE = 0;
/**
 * The event type code of mouse down event.
 * @constant
 * @type {number}
 */
EventMouse.DOWN = 1;
/**
 * The event type code of mouse up event.
 * @constant
 * @type {number}
 */
EventMouse.UP = 2;
/**
 * The event type code of mouse move event.
 * @constant
 * @type {number}
 */
EventMouse.MOVE = 3;
/**
 * The event type code of mouse scroll event.
 * @constant
 * @type {number}
 */
EventMouse.SCROLL = 4;

/**
 * The tag of Mouse left button
 * @constant
 * @type {Number}
 */
EventMouse.BUTTON_LEFT = 0;

/**
 * The tag of Mouse right button  (The right button number is 2 on browser)
 * @constant
 * @type {Number}
 */
EventMouse.BUTTON_RIGHT = 2;

/**
 * The tag of Mouse middle button  (The right button number is 1 on browser)
 * @constant
 * @type {Number}
 */
EventMouse.BUTTON_MIDDLE = 1;

/**
 * The tag of Mouse button 4
 * @constant
 * @type {Number}
 */
EventMouse.BUTTON_4 = 3;

/**
 * The tag of Mouse button 5
 * @constant
 * @type {Number}
 */
EventMouse.BUTTON_5 = 4;

/**
 * The tag of Mouse button 6
 * @constant
 * @type {Number}
 */
EventMouse.BUTTON_6 = 5;

/**
 * The tag of Mouse button 7
 * @constant
 * @type {Number}
 */
EventMouse.BUTTON_7 = 6;

/**
 * The tag of Mouse button 8
 * @constant
 * @type {Number}
 */
EventMouse.BUTTON_8 = 7;

/**
 * The touch event
 * @class cc.Event.EventTouch
 * @constructor
 * @extends cc.Event
 * @param {Array} [touchArr=[]] - The array of the touches
 * @param {boolean} [bubbles=false] - A boolean indicating whether the event bubbles up through the tree or not
 */
EventTouch = function (touchArr, bubbles) {
    cc.Event.call(this, cc.Event.TOUCH, bubbles);
    this._eventCode = 0;
    this._touches = touchArr || [];
    this.currentTouch = null;
};

JS.extend(EventTouch, cc.Event);
JS.mixin(EventTouch.prototype, {
    /**
     * Returns event code
     * @returns {number}
     */
    getEventCode: function () {
        return this._eventCode;
    },

    /**
     * Returns touches of event
     * @returns {Array}
     */
    getTouches: function () {
        return this._touches;
    },

    _setEventCode: function (eventCode) {
        this._eventCode = eventCode;
    },

    _setTouches: function (touches) {
        this._touches = touches;
    }
});

/**
 * The maximum touch numbers
 * @constant
 * @type {Number}
 */
EventTouch.MAX_TOUCHES = 5;

/**
 * The event type code of touch began event.
 * @constant
 * @type {number}
 */
EventTouch.BEGAN = 0;
/**
 * The event type code of touch moved event.
 * @constant
 * @type {number}
 */
EventTouch.MOVED = 1;
/**
 * The event type code of touch ended event.
 * @constant
 * @type {number}
 */
EventTouch.ENDED = 2;
/**
 * The event type code of touch cancelled event.
 * @constant
 * @type {number}
 */
EventTouch.CANCELED = 3;

/**
 * Focus change event for UI widget
 * @class cc.Event.EventFocus
 * @constructor
 * @extends cc.Event
 * @param {ccui.Widget} widgetLoseFocus
 * @param {ccui.Widget} widgetGetFocus
 * @param {boolean} [bubbles=false] - A boolean indicating whether the event bubbles up through the tree or not
 */
EventFocus = function (widgetGetFocus, widgetLoseFocus, bubbles) {
    cc.Event.call(this, cc.Event.FOCUS, bubbles);
    this._widgetGetFocus = widgetGetFocus;
    this._widgetLoseFocus = widgetLoseFocus;
};
JS.extend(EventFocus, cc.Event);

/**
 * The acceleration event
 * @class cc.Event.EventAcceleration
 * @extends cc.Event
 * @constructor
 * @param {Object} acc - The acceleration
 * @param {boolean} [bubbles=false] - A boolean indicating whether the event bubbles up through the tree or not
 */
EventAcceleration = function (acc, bubbles) {
    cc.Event.call(this, Event.ACCELERATION, bubbles);
    this._acc = acc;
};
JS.extend(EventAcceleration, cc.Event);

/**
 * The keyboard event
 * @class cc.Event.EventKeyboard
 * @extends cc.Event
 * @constructor
 * @param {Number} keyCode - The key code of which triggered this event
 * @param {boolean} isPressed - A boolean indicating whether the key have been pressed
 * @param {boolean} [bubbles=false] - A boolean indicating whether the event bubbles up through the tree or not
 */
EventKeyboard = function (keyCode, isPressed, bubbles) {
    cc.Event.call(this, Event.KEYBOARD, bubbles);
    this._keyCode = keyCode;
    this._isPressed = isPressed;
};
JS.extend(EventKeyboard, cc.Event);

cc.Event.EventMouse = EventMouse;
cc.Event.EventTouch = EventTouch;
cc.Event.EventFocus = EventFocus;
cc.Event.EventAcceleration = EventAcceleration;
cc.Event.EventKeyboard = EventKeyboard;

module.exports = cc.Event;