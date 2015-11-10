/**
 * @module cc
 */

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

var AnimationAnimator = require('../../animation/animation-animator');
var AnimationClip = require('../../animation/animation-clip');

/**
 * Renders a sprite in the scene.
 * @class AnimationComponent
 * @extends CCComponent
 */
var AnimationComponent = cc.Class({
    name: 'cc.AnimationComponent',
    extends: require('./CCComponent'),

    ctor: function () {
        // The actual implement for Animation
        this._animator = null;

        this._nameToState = {};
        this._didInit = false;

        this._currentClip = null;
    },

    properties: {
        defaultClip: {
            default: null,
            type: AnimationClip,
            displayName: 'Animation'
        },

        currentCip: {
            get: function () {
                return this._currentClip;
            },
            set: function (value, force) {
                this._currentClip = value;

                if (CC_EDITOR && force) {
                    this.sample();
                }
            },
            type: AnimationClip,
            visible: false
        },

        _clips: {
            default: [],
            type: [AnimationClip],
            displayName: 'Animations'
        },


        playAutomatically: true,
    },

    onLoad: function () {
        this._init();
    },

    start: function () {
        if (/*this.enabled && */this.playAutomatically && this.defaultClip) {
            var state = this.getAnimationState(this.defaultClip.name);
            this._animator.playState(state);
        }
    },

    onDisable: function () {
        this.stop();
    },

    ///////////////////////////////////////////////////////////////////////////////
    // Public Methods
    ///////////////////////////////////////////////////////////////////////////////

    /**
     * Plays an animation.
     * @method play
     * @param {String} [name] - The name of animation to play. If no name is supplied then the default animation will be played.
     * @return {AnimationState} - The AnimationState of playing animation. In cases where the animation can't be played (ie, there is no default animation or no animation with the specified name), the function will return null.
     */
    play: function (name, startTime) {
        this._init();
        var state = this.getAnimationState(name || this.defaultClip.name);
        if (state) {
            if (state.isPlaying) {
                this._animator.stopState(state);
            }
            this._animator.playState(state, startTime);

            this.currentCip = state.clip;
        }
        return state;
    },

    /**
     * Stops an animation named name. If no name is supplied then stops all playing animations that were started with this Animation.
     * Stopping an animation also Rewinds it to the Start.
     * @method stop
     * @param {String} [name] - The animation to stop, if not supplied then stops all playing animations.
     */
    stop: function (name) {
        if (!this._didInit) {
            return;
        }
        if (name) {
            var state = this._nameToState[name];
            if (state) {
                this._animator.stopState(state);
            }
        }
        else {
            this._animator.stop();
        }
    },

    /**
     * Returns the animation state named name. If no animation with the specified name, the function will return null.
     * @method getAnimationState
     * @param {String} name
     * @return {AnimationState}
     */
    getAnimationState: function (name) {
        return this._nameToState[name] || null;
    },

    /**
     * Adds a clip to the animation with name newName. If a clip with that name already exists it will be replaced with the new clip.
     * @method addClip
     * @param {AnimationClip} clip - the clip to add
     * @param {String} [newName]
     * @return {AnimationState} - The AnimationState which gives full control over the animation clip.
     */
    addClip: function (clip, newName) {
        if (!clip) {
            cc.warn('Invalid clip to add');
            return;
        }
        this._init();

        // add clip
        if (!cc.js.array.contains(this._clips, clip)) {
            this._clips.push(clip);
        }

        // replace same name clip
        newName = newName || clip.name;
        var oldState = this._nameToState[newName];
        if (oldState) {
            if (oldState.clip === clip) {
                return oldState;
            }
            else {
                this._clips.splice(this._clips.indexOf(oldState.clip), 1);
            }
        }

        // replace state
        var newState = new cc.AnimationState(clip, newName);
        this._nameToState[newName] = newState;
        return newState;
    },

    _removeStateIfNotUsed: function (state) {
        if (state.clip !== this.defaultClip && !cc.js.array.contains(this._clips, state.clip)) {
            delete this._nameToState[state.name];
        }
    },

    /**
     * Remove clip from the animation list. This will remove the clip and any animation states based on it.
     * @method removeClip
     * @param {AnimationClip} clip
     */
    removeClip: function (clip) {
        if (!clip) {
            cc.warn('Invalid clip to remove');
            return;
        }
        this._init();

        this._clips = this._clips.filter(function (item) {
            return item !== clip;
        });

        var state;
        for (var name in this._nameToState) {
            state = this._nameToState[name];
            if (state.clip === clip) {
                this._removeStateIfNotUsed(state);
            }
        }
    },

    /**
     * Samples animations at the current state.
     * This is useful when you explicitly want to set up some animation state, and sample it once.
     * @method sample
     */
    sample: function () {
        this._init();
        this._animator.sample();
    },

    ///////////////////////////////////////////////////////////////////////////////
    // Internal Methods
    ///////////////////////////////////////////////////////////////////////////////

    // Dont forget to call _init before every actual process in public methods. (Or checking this.isOnLoadCalled)
    // Just invoking _init by onLoad is not enough because onLoad is called only if the entity is active.

    _init: function () {
        if (this._didInit) {
            return;
        }
        this._didInit = true;
        this._animator = new AnimationAnimator(this.node, this);
        this._createStates();
    },

    _createStates: function() {
        // create animation states
        var state = null;
        var defaultClipState = false;
        for (var i = 0; i < this._clips.length; ++i) {
            var clip = this._clips[i];
            if (clip) {
                state = new cc.AnimationState(clip);
                this._nameToState[state.name] = state;
                if (this.defaultClip === clip) {
                    defaultClipState = state;
                }
            }
        }
        if (this.defaultClip && !defaultClipState) {
            state = new cc.AnimationState(this.defaultClip);
            this._nameToState[state.name] = state;
        }
    },
});


cc.AnimationComponent = module.exports = AnimationComponent;
