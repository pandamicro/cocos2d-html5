var ValueType = require('./CCValueType');
var JS = require('../platform/js');

/**
 * cc.Size is the class for size object, please do not use its constructor to create sizes, use cc.size() alias function instead.
 * It will be deprecated soon, please use cc.Vec2 instead
 * @class cc.Size
 * @param {Number} width
 * @param {Number} height
 * @see cc.size
 */
cc.Size = function (width, height) {
    this.width = width || 0;
    this.height = height || 0;
};
JS.extend(cc.Size, ValueType);
require('../platform/CCClass').fastDefine('cc.Size', cc.Size, ['width', 'height']);

var proto = cc.Size.prototype;

/**
 * @method clone
 * @return {cc.Size}
 */
proto.clone = function () {
    return new cc.Size(this.width, this.height);
};

/**
 * @method equals
 * @param {cc.Size} other
 * @return {Boolean}
 */
proto.equals = function (other) {
    return other &&
           this.width === other.width &&
           this.height === other.height;
};

/**
 * @method lerp
 * @param {cc.Rect} to
 * @param {number} ratio - the interpolation coefficient
 * @param {cc.Size} [out] - optional, the receiving vector
 * @return {cc.Size}
 */
proto.lerp = function (to, ratio, out) {
    out = out || new cc.Size();
    var width = this.width;
    var height = this.height;
    out.width = width + (to.width - width) * ratio;
    out.height = height + (to.height - height) * ratio;
    return out;
};

/**
 * @method toString
 * @return {string}
 */
proto.toString = function () {
    return '(' + this.width.toFixed(2) + ', ' + this.height.toFixed(2) + ')';
};

/**
 * Helper function that creates a cc.Size.
 * Please use cc.p or cc.v2 instead, it will soon replace cc.Size
 * @function
 * @param {Number|cc.Size} w width or a size object
 * @param {Number} h height
 * @return {cc.Size}
 * @example
 * var size1 = cc.size();
 * var size2 = cc.size(100,100);
 * var size3 = cc.size(size2);
 * var size4 = cc.size({width: 100, height: 100});
 */
cc.size = function (w, h) {
    if (w === undefined)
        return new cc.Size(0, 0);
    if (h === undefined)
        return new cc.Size(w.width, w.height);
    return new cc.Size(w, h);
};

/**
 * Check whether a point's value equals to another
 * @function
 * @param {cc.Size} size1
 * @param {cc.Size} size2
 * @return {Boolean}
 */
cc.sizeEqualToSize = function (size1, size2) {
    return (size1 && size2 && (size1.width === size2.width) && (size1.height === size2.height));
};

module.exports = cc.Size;