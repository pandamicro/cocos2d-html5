
var bezier = require('./bezier').bezier;
var bezierByTime = require('./bezier').bezierByTime;

var binarySearch = require('./binary-search');
var WrapMode = require('./types').WrapMode;
var WrapModeMask = require('./types').WrapModeMask;

//
// 动画数据类，相当于 AnimationClip。
// 虽然叫做 AnimCurve，但除了曲线，可以保存任何类型的值。
//
// @class AnimCurve
// @constructor
//
var AnimCurve = cc.Class({
    name: 'cc.AnimCurve',

    //
    // @method sample
    // @param {number} time
    // @param {number} ratio - The normalized time specified as a number between 0.0 and 1.0 inclusive.
    // @param {AnimationNode} animationNode
    //
    sample: function (time, ratio, animationNode) {},

    onTimeChangedManually: function () {}
});


//
// 区别于 SampledAnimCurve。
//
// @class DynamicAnimCurve
// @constructor
// @extends AnimCurve
//
var DynamicAnimCurve = cc.Class({
    name: 'cc.DynamicAnimCurve',
    extends: AnimCurve,

    properties: {

        // The object being animated.
        // @property target
        // @type {object}
        target: null,

        // The name of the property being animated.
        // @property prop
        // @type {string}
        prop: "",

        // The values of the keyframes. (y)
        // @property values
        // @type {any[]}
        values: [],

        // The keyframe ratio of the keyframe specified as a number between 0.0 and 1.0 inclusive. (x)
        // @property ratios
        // @type {number[]}
        ratios: [],

        // @property types
        // @param {object[]}
        // Each array item maybe type:
        // - [x, x, x, x]: Four control points for bezier
        // - null: linear
        types: [],

        // @property {string[]} subProps - The path of sub property being animated.
        subProps: null
    },

    _calcValue: function (frameIndex, ratio) {
        var values = this.values;
        var fromVal = values[frameIndex - 1];
        var toVal = values[frameIndex];

        // lerp
        if (typeof fromVal === 'number') {
            value = fromVal + (toVal - fromVal) * ratio;
        }
        else {
            var lerp = fromVal.lerp;
            if (lerp) {
                value = fromVal.lerp(toVal, ratio);
            }
            else {
                // no linear lerp function, just return last frame
                value = fromVal;
            }
        }

        return value;
    },

    _applyValue: function (target, prop, value) {
        target[prop] = value;
    },

    _findFrameIndex: binarySearch,

    sample: function (time, ratio, animationNode) {
        var values = this.values;
        var ratios = this.ratios;
        var frameCount = ratios.length;

        if (frameCount === 0) {
            return;
        }

        // evaluate value
        var value;
        var index = this._findFrameIndex(ratios, ratio);

        if (index < 0) {
            index = ~index;

            if (index <= 0) {
                value = values[0];
            }
            else if (index >= frameCount) {
                value = values[frameCount - 1];
            }
            else {
                var fromRatio = ratios[index - 1];
                var toRatio = ratios[index];
                var type = this.types[index - 1];
                var ratioBetweenFrames = (ratio - fromRatio) / (toRatio - fromRatio);

                if (Array.isArray(type)) {
                    // bezier curve
                    ratioBetweenFrames = bezierByTime(type, ratioBetweenFrames);
                }

                value = this._calcValue(index, ratioBetweenFrames);
            }
        }
        else {
            value = values[index];
        }

        var subProps = this.subProps;
        if (subProps) {
            // create batched value dynamically
            var mainProp = this.target[this.prop];
            var subProp = mainProp;

            for (var i = 0; i < subProps.length - 1; i++) {
                var subPropName = subProps[i];
                if (subProp) {
                    subProp = subProp[subPropName];
                }
                else {
                    return;
                }
            }

            var propName = subProps[subProps.length - 1];

            if (subProp) {
                this._applyValue(subProp, propName, value);
            }
            else {
                return;
            }

            value = mainProp;
        }

        // apply value
        this._applyValue(this.target, this.prop, value);
    }
});

DynamicAnimCurve.Linear = null;
DynamicAnimCurve.Bezier = function (controlPoints) {
    return controlPoints;
};



/**
 * SampledAnimCurve, 这里面的数值需要是已经都预先sample好了的,
 * 所以 SampledAnimCurve 中查找 frame index 的速度会非常快
 *
 * @class SampledAnimCurve
 * @constructor
 * @extends DynamicAnimCurve
 */
var SampledAnimCurve = cc.Class({
    name: 'cc.SampledAnimCurve',
    extends: DynamicAnimCurve,

    _findFrameIndex: function (ratios, ratio) {
        var length = ratios.length - 1;
        var eachLength = 1 / length;

        var index = (ratio / eachLength) | 0;
        return index;
    }
});



/**
 * Event information,
 * @class EventInfo
 * @constructor
 */
var EventInfo = function () {
    this.events = [];
};

/**
 * @param {Function} [func] event function
 * @param {Object[]} [params] event params
 */
EventInfo.prototype.add = function (func, params) {
    this.events.push({
        func: func || '',
        params: params || []
    });
};


/**
 *
 * @class EventAnimCurve
 * @constructor
 * @extends AnimCurve
 */
var EventAnimCurve = cc.Class({
    name: 'cc.EventAnimCurve',
    extends: AnimCurve,

    properties: {
        /**
         * The object being animated.
         * @property target
         * @type {object}
         */
        target: null,

        /** The keyframe ratio of the keyframe specified as a number between 0.0 and 1.0 inclusive. (x)
         * @property ratios
         * @type {number[]}
         */
        ratios: [],

        /**
         * @property events
         * @type {EventInfo[]}
         */
        events: [],

        /**
         * Last event index
         * @property _lastEventIndex
         * @type {Number}
         * @default null
         */
        _lastEventIndex: null,

        /**
         * Last loop iterations
         * @property _lastIterations
         * @type {Number}
         * @default -1
         */
        _lastTime: 0
    },

    sample: function (time, ratio, animationNode) {
        if (this.events.length === 0) return;

        var delta = 1 / animationNode.frameRate * animationNode.speed;

        time = animationNode.time;

        var lastIndex = this._lastEventIndex;
        var lastTime = lastIndex === null ? time : this._lastTime;
        var events = this.events;
        var length = events.length;

        while (delta > 0 ? lastTime <= time : lastTime >= time) {
            lastTime += delta;

            var tempTime = lastTime;
            if (delta > 0 ? tempTime > time : tempTime < time) tempTime = time;

            var info = animationNode.getWrappedInfo(tempTime);
            var direction = info.direction;

            var currentIndex = binarySearch(this.ratios, info.ratio);
            if (currentIndex < 0) {
                currentIndex = ~currentIndex - 1;

                // if direction is inverse, then increase index
                if (direction < 0) currentIndex += 1;
            }

            if (direction < 0 && lastIndex === -1) lastIndex = length;

            if (currentIndex !== lastIndex) {
                if (currentIndex >= 0 && currentIndex < length) {
                    this._fireEvent(events[currentIndex]);
                }
            }

            // ensure ping pong wrape mode only trigger last or first event once when loop back
            if (lastIndex === length - 1 && currentIndex === length) continue;
            else if (lastIndex === 0 && currentIndex === -1) continue;

            lastIndex = currentIndex;
        }

        this._lastTime = time;
        this._lastEventIndex = lastIndex;
    },

    _fireEvent: function (eventInfo) {
        var events = eventInfo.events;
        var components = this.target._components;

        for (var i = 0;  i < events.length; i++) {
            var event = events[i];
            var funcName = event.func;

            for (var j = 0; j < components.length; j++) {
                var component = components[j];
                var func = component[funcName];

                if (func) func.apply(component, event.params);
            }
        }
    },

    onTimeChangedManually: function () {
        this._lastEventIndex = null;
        this._lastTime = 0;
    }
});


if (CC_TEST) {
    cc._Test.DynamicAnimCurve = DynamicAnimCurve;
    cc._Test.SampledAnimCurve = SampledAnimCurve;
    cc._Test.EventAnimCurve = EventAnimCurve;
}

module.exports = {
    AnimCurve: AnimCurve,
    DynamicAnimCurve: DynamicAnimCurve,
    SampledAnimCurve: SampledAnimCurve,
    EventAnimCurve: EventAnimCurve,
    EventInfo: EventInfo
};
