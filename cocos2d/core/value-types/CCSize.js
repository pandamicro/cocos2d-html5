
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
