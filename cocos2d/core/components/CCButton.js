/****************************************************************************
 Copyright (c) 2015 Chukong Technologies Inc.

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

var Transition = cc.Enum({
    None: 0,
    Color: 1,
    Sprite: 2
});

var ButtonState = cc.Enum({
    Normal: 0,
    Pressed: 1,
    Hover: 2,
    Disabled: 3
});

var WHITE = cc.Color.WHITE;

var Button = cc.Class({
    name: 'cc.Button',
    extends: require('./CCComponent'),

    ctor: function () {
        this._touchListener = null;
        this._mouseListener = null;

        this._pressed = false;
        this._hovered = false;

        this._stateHandlers = {};
        this._sprite = null;

        this._fromColor = null;
        this._toColor = null;
        this._time = 0;
        this._tarnsitionFinished = true;
    },

    editor: CC_EDITOR && {
        menu: 'Button',
        executeInEditMode: true
    },

    properties: {
        interactable: {
            default: true,
            notify: function () {
                this._initState();
            }
        },

        transition: {
            default: Transition.None,
            type: Transition
        },

        // color transition
        normalColor: {
            default: WHITE,
            notify: function () {
                this._initState();
            }
        },

        pressedColor: {
            default: WHITE
        },

        hoverColor: {
            default: WHITE
        },

        disabledColor: {
            default: WHITE,
            notify: function () {
                this._initState();
            }
        },

        duration: {
            default: 0.1,
            range: [0, Number.MAX_VALUE]
        },

        // sprite transition
        normalSprite: {
            default: null,
            type: cc.SpriteFrame,
            notify: function () {
                this._initState();
            }
        },

        pressedSprite: {
            default: null,
            type: cc.SpriteFrame
        },

        hoverSprite: {
            default: null,
            type: cc.SpriteFrame
        },

        disabledSprite: {
            default: null,
            type: cc.SpriteFrame,
            notify: function () {
                this._initState();
            }
        },

        target: {
            default: null,
            type: cc.ENode,

            notify: function () {
                this._applyTarget();
            }
        },

        eventListeners: {
            default: [],
            type: cc.ENode
        }
    },

    onLoad: function () {
        if (!this.target) this.target = this.node;

        this._registerEvent();
        this._registerStateHandler();

        this._applyTarget();
        this._initState();
    },

    onDestroy: function () {
        if (this._touchListener) cc.eventManager.removeListener(this._touchListener);
        if (this._mouseListener) cc.eventManager.removeListener(this._mouseListener);
    },

    update: function (dt) {
        var target = this.target;
        if (!this.transition === Transition.Color || !target || this._tarnsitionFinished) return;

        this.time += dt;
        var ratio = this.time / this.duration;
        if (ratio > 1) {
            ratio = 1;
            this._tarnsitionFinished = true;
        }

        target.color = this._fromColor.lerp(this._toColor, ratio);
    },

    _registerEvent: function () {
        this._touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this._onTouchBegan.bind(this),
            onTouchEnded: this._onTouchEnded.bind(this)
        });
        cc.eventManager.addListener(this._touchListener, this.node._sgNode);

        if (!cc.sys.isMobile) {
            this._mouseListener = cc.EventListener.create({
                event: cc.EventListener.MOUSE,
                onMouseMove: this._onMouseMove.bind(this)
            });
            cc.eventManager.addListener(this._mouseListener, this.node._sgNode);
        }
    },

    _registerStateHandler: function () {
        this._stateHandlers[ButtonState.Normal]     = this._onNormalState.bind(this);
        this._stateHandlers[ButtonState.Pressed]    = this._onPressedState.bind(this);
        this._stateHandlers[ButtonState.Hover]      = this._onHoverState.bind(this);
        this._stateHandlers[ButtonState.Disabled]   = this._onDisabledState.bind(this);
    },

    _applyTarget: function () {
        var target = this.target;
        if (target) {
            this._sprite = target.getComponent(cc.SpriteRenderer);
        }
        else {
            this._sprite = null;
        }
    },

    _initState: function () {
        var state = this.interactable ? ButtonState.Normal : ButtonState.Disabled;
        this._applyState(state);
    },

    // touch event handler
    _onTouchBegan: function (touch) {
        if (!this.interactable) return false;

        var hitted = this._hitTest(touch.getLocation());
        if (hitted) {
            this._applyState(ButtonState.Pressed);
        }

        return hitted;
    },

    _onTouchEnded: function () {
        this._applyState(ButtonState.Normal);
    },

    _onMouseMove: function (event) {
        if (this._pressed || !this.interactable) return;

        var hitted = this._hitTest(event.getLocation());
        if (hitted) {
            if (!this._hovered) {
                this._hovered = true;
                this._applyState(ButtonState.Hover);
            }
        }
        else if (this._hovered) {
            this._hovered = false;
            this._applyState(ButtonState.Normal);
        }
    },

    // state handler
    _applyState: function (state) {
        var handler = this._stateHandlers[state];
        handler();
    },
    _applyTransition: function (color, sprite) {
        var transition = this.transition;

        if (transition === Transition.Color) {
            var target = this.target;

            if (CC_EDITOR) {
                target.color = color;
            }
            else {
                this._fromColor = target.color.clone();
                this._toColor = color;
                this.time = 0;
                this._tarnsitionFinished = false;
            }
        }
        else if (transition === Transition.Sprite && this._sprite) {
            this._sprite.sprite = sprite;
        }
    },
    _onNormalState: function () {
        this._pressed = false;
        this._applyTransition(this.normalColor, this.normalSprite);
    },

    _onPressedState: function () {
        this._pressed = true;
        this._applyTransition(this.pressedColor, this.pressedSprite);
    },

    _onDisabledState: function () {
        this._applyTransition(this.disabledColor, this.disabledSprite);
    },

    _onHoverState: function () {
        this._applyTransition(this.hoverColor, this.hoverSprite);
    },

    // hit test
    _hitTest: function (pos) {
        var target = this.target;
        if (!target) return false;

        var w = target.width;
        var h = target.height;
        var anchor = target.getAnchorPoint();

        var rect = cc.rect(-anchor.x*w, -anchor.y*h, w, h);
        return cc.rectContainsPoint(rect, target.convertToNodeSpace(pos));
    },

    _emit: function (eventName) {
        var listeners = this.eventListeners;
        for (var i = 0, l = listeners.length; i < l; i++) {
            var listener = listeners[i];
            var func = listener[eventName];
            if (func) {
                func.call(listener);
            }
        }
    }
 });

 cc.EButton = module.exports = Button;