var ValueType = require('./CCValueType');
var JS = require('../js');

/**
 * A 2D rectangle defined by x, y position and width, height.
 *
 * see {% crosslink cc.FireRect cc.fireRect %}
 *
 * @class Rect
 * @extends ValueType
 * @constructor
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @param {number} [w=0]
 * @param {number} [h=0]
 */
function Rect (x, y, w, h) {
    this.x = typeof x === 'number' ? x : 0.0;
    this.y = typeof y === 'number' ? y : 0.0;
    this.width = typeof w === 'number' ? w : 0.0;
    this.height = typeof h === 'number' ? h : 0.0;
}
JS.extend(Rect, ValueType);
require('../CCFireClass').fastDefine('cc.FireRect', Rect, ['x', 'y', 'width', 'height']);

/**
 * Creates a rectangle from two coordinate values.
 * @static
 * @method fromMinMax
 * @param {Vec2} v1
 * @param {Vec2} v2
 * @return {Rect}
 */
Rect.fromMinMax = function (v1, v2) {
    var min_x = Math.min(v1.x, v2.x);
    var min_y = Math.min(v1.y, v2.y);
    var max_x = Math.max(v1.x, v2.x);
    var max_y = Math.max(v1.y, v2.y);

    return new Rect(min_x, min_y, max_x - min_x, max_y - min_y);
};

/**
 * Creates a rectangle from left-top coordinate value and size.
 * @static
 * @method fromVec2
 * @param {Vec2} leftTop
 * @param {Vec2} size
 * @return {Rect}
 */
Rect.fromVec2 = function (leftTop, size) {
    return new Rect(leftTop.x, leftTop.y, size.x, size.y);
};

/**
 * Checks if rect contains
 * @static
 * @method contain
 * @param a {Rect} Rect a
 * @param b {Rect} Rect b
 * @return {Number} The contains result, 1 is a contains b, -1 is b contains a, 0 is no contains
 */
Rect.contain = function _Contain (a, b) {
    if (a.x <= b.x &&
        a.x + a.width >= b.x + b.width &&
        a.y <= b.y &&
        a.y + a.height >= b.y + b.height) {
        // a contains b
        return 1;
    }
    if (b.x <= a.x &&
        b.x + b.width >= a.x + a.width &&
        b.y <= a.y &&
        b.y + b.height >= a.y + a.height) {
        // b contains a
        return -1;
    }
    return 0;
};

var proto = Rect.prototype;

/**
 * @method clone
 * @return {Rect}
 */
proto.clone = function () {
    return new Rect(this.x, this.y, this.width, this.height);
};

/**
 * @method equals
 * @param {Rect} other
 * @return {Boolean}
 */
proto.equals = function (other) {
    return other &&
           this.x === other.x &&
           this.y === other.y &&
           this.width === other.width &&
           this.height === other.height;
};

/**
 * @method lerp
 * @param {Rect} to
 * @param {number} ratio - the interpolation coefficient
 * @param {Rect} [out] - optional, the receiving vector
 * @return {Rect}
 */
proto.lerp = function (to, ratio, out) {
    out = out || new Rect();
    var x = this.x;
    var y = this.y;
    var width = this.width;
    var height = this.height;
    out.x = x + (to.x - x) * ratio;
    out.y = y + (to.y - y) * ratio;
    out.width = width + (to.width - width) * ratio;
    out.height = height + (to.height - height) * ratio;
    return out;
};

/**
 * @method toString
 * @return {string}
 */
proto.toString = function () {
    return '(' + this.x.toFixed(2) + ', ' + this.y.toFixed(2) + ', ' + this.width.toFixed(2) +
           ', ' + this.height.toFixed(2) + ')';
};

/**
 * @property xMin
 * @type number
 */
Object.defineProperty(proto, 'xMin', {
    get: function () { return this.x; },
    set: function (value) {
        this.width += this.x - value;
        this.x = value;
    }
});

/**
 * @property yMin
 * @type number
 */
Object.defineProperty(proto, 'yMin', {
    get: function () { return this.y; },
    set: function (value) {
        this.height += this.y - value;
        this.y = value;
    }
});

/**
 * @property xMax
 * @type number
 */
Object.defineProperty(proto, 'xMax', {
    get: function () { return this.x + this.width; },
    set: function (value) { this.width = value - this.x; }
});

/**
 * @property yMax
 * @type number
 */
Object.defineProperty(proto, 'yMax', {
    get: function () { return this.y + this.height; },
    set: function (value) { this.height = value - this.y; }
});

/**
 * @property center
 * @type number
 */
Object.defineProperty(proto, 'center', {
    get: function () {
        return new cc.Vec2(this.x + this.width * 0.5,
            this.y + this.height * 0.5);
    },
    set: function (value) {
        this.x = value.x - this.width * 0.5;
        this.y = value.y - this.height * 0.5;
    }
});

/**
 * @property size
 * @type {Vec2}
 */
Object.defineProperty(proto, 'size', {
    get: function () {
        return new cc.Vec2(this.width, this.height);
    },
    set: function (value) {
        this.width = value.x;
        this.height = value.y;
    }
});

/**
 * @method intersects
 * @param {Rect} rect
 * @type {Boolean}
 */
proto.intersects = function (rect) {
    return cc.rectIntersectsRect(this, rect);
};

/**
 * Returns true if the point inside this rectangle.
 * @method contains
 * @param {Vec2} point
 * @type {Boolean}
 */
proto.contains = function (point) {
    return (this.x <= point.x &&
            this.x + this.width >= point.x &&
            this.y <= point.y &&
            this.y + this.height >= point.y);
};

/**
 * Returns true if the other rect totally inside this rectangle.
 * @method containsRect
 * @param {Rect} rect
 * @type {Boolean}
 */
proto.containsRect = function (rect) {
    return (this.x <= rect.x &&
            this.x + this.width >= rect.x + rect.width &&
            this.y <= rect.y &&
            this.y + this.height >= rect.y + rect.height);
};

cc.FireRect = Rect;


/**
 * @module cc
 */
/**
 * The convenience method to create a new Rect
 * @method rect
 * @param {Number[]|Number} [x=0]
 * @param {Number} [y=0]
 * @param {Number} [w=0]
 * @param {Number} [h=0]
 * @return {Rect}
 */
cc.fireRect = function rect (x, y, w, h) {
    if (Array.isArray(x)) {
        return new Rect(x[0], x[1], x[2], x[3]);
    }
    else {
        return new Rect(x, y, w, h);
    }
};
