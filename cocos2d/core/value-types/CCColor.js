var ValueType = require('./CCValueType');
var JS = require('../platform/js');

var Color = (function () {

    /**
     * Representation of RGBA colors.
     *
     * Each color component is a floating point value with a range from 0 to 1.
     *
     * You can also use the convenience method <% crosslink cc.fireColor cc.fireColor %> to create a new Color.
     *
     * @class Color
     * @extends ValueType
     * @constructor
     * @param {number} [r=0] - red component of the color
     * @param {number} [g=0] - green component of the color
     * @param {number} [b=0] - blue component of the color
     * @param {number} [a=255] - alpha component of the color
     */
    function Color( r, g, b, a ) {
        this.r = typeof r === 'number' ? r : 0;
        this.g = typeof g === 'number' ? g : 0;
        this.b = typeof b === 'number' ? b : 0;
        this.a = typeof a === 'number' ? a : 255;
    }
    JS.extend(Color, ValueType);
    require('../platform/CCFireClass').fastDefine('cc.Color', Color, ['r', 'g', 'b', 'a']);

    var DefaultColors = {
        // color: [r, g, b, a]
        /**
         * @property white
         * @type Color
         * @static
         */
        white:      [255, 255, 255, 255],
        /**
         * @property black
         * @type Color
         * @static
         */
        black:      [0, 0, 0, 255],
        /**
         * @property transparent
         * @type Color
         * @static
         */
        transparent:[0, 0, 0, 0],
        /**
         * @property gray
         * @type Color
         * @static
         */
        gray:       [127.5, 127.5, 127.5],
        /**
         * @property red
         * @type Color
         * @static
         */
        red:        [255, 0, 0],
        /**
         * @property green
         * @type Color
         * @static
         */
        green:      [0, 255, 0],
        /**
         * @property blue
         * @type Color
         * @static
         */
        blue:       [0, 0, 255],
        /**
         * @property yellow
         * @type Color
         * @static
         */
        yellow:     [255, 235, 4],
        /**
         * @property cyan
         * @type Color
         * @static
         */
        cyan:       [0, 255, 255],
        /**
         * @property magenta
         * @type Color
         * @static
         */
        magenta:    [255, 0, 255]
    };
    for (var colorName in DefaultColors) {
        var colorGetter = (function (r, g, b, a) {
            return function () {
                return new Color(r, g, b, a);
            };
        }).apply(null, DefaultColors[colorName]);
        Object.defineProperty(Color, colorName, { get: colorGetter });
    }

    /**
     * Clone a new color from the current color.
     * @method clone
     * @return {Color} Newly created color.
     */
    Color.prototype.clone = function () {
        return new Color(this.r, this.g, this.b, this.a);
    };

    /**
     * @method equals
     * @param {Color} other
     * @return {Boolean}
     */
    Color.prototype.equals = function (other) {
        return other &&
               this.r === other.r &&
               this.g === other.g &&
               this.b === other.b &&
               this.a === other.a;
    };

    /**
     * @method lerp
     * @param {Color} to
     * @param {number} ratio - the interpolation coefficient
     * @param {Color} [out] - optional, the receiving vector
     * @return {Color}
     */
    Color.prototype.lerp = function (to, ratio, out) {
        out = out || new Color();
        var r = this.r;
        var g = this.g;
        var b = this.b;
        var a = this.a;
        out.r = r + (to.r - r) * ratio;
        out.g = g + (to.g - g) * ratio;
        out.b = b + (to.b - b) * ratio;
        out.a = a + (to.a - a) * ratio;
        return out;
    };

    /**
     * @method toString
     * @return {string}
     */
    Color.prototype.toString = function () {
        return "rgba(" +
            this.r.toFixed() + ", " +
            this.g.toFixed() + ", " +
            this.b.toFixed() + ", " +
            this.a.toFixed() + ")"
        ;
    };

    /**
     * @method setR
     * @param {number} red - the new Red component
     * @return {Color} this color
     */
    Color.prototype.setR = function (red) {
        this.r = red;
        return this;
    };
    /**
     * @method setG
     * @param {number} green - the new Green component
     * @return {Color} this color
     */
    Color.prototype.setG = function (green) {
        this.g = green;
        return this;
    };
    /**
     * @method setB
     * @param {number} blue - the new Blue component
     * @return {Color} this color
     */
    Color.prototype.setB = function (blue) {
        this.b = blue;
        return this;
    };
    /**
     * @method setA
     * @param {number} alpha - the new Alpha component
     * @return {Color} this color
     */
    Color.prototype.setA = function (alpha) {
        this.a = alpha;
        return this;
    };

    /**
     * @method toCSS
     * @param {string} opt - "rgba", "rgb", "#rgb" or "#rrggbb"
     * @return {string}
     */
    Color.prototype.toCSS = function ( opt ) {
        if ( opt === 'rgba' ) {
            return "rgba(" +
                (this.r | 0 ) + "," +
                (this.g | 0 ) + "," +
                (this.b | 0 ) + "," +
                (this.a / 255).toFixed(2) + ")"
            ;
        }
        else if ( opt === 'rgb' ) {
            return "rgb(" +
                (this.r | 0 ) + "," +
                (this.g | 0 ) + "," +
                (this.b | 0 ) + ")"
            ;
        }
        else {
            return '#' + this.toHEX(opt);
        }
    };

    /**
     * Clamp this color to make all components between 0 to 1.
     * @method clamp
     */
    Color.prototype.clamp = function () {
        this.r = cc.clampf(this.r, 0, 255);
        this.g = cc.clampf(this.g, 0, 255);
        this.b = cc.clampf(this.b, 0, 255);
        this.a = cc.clampf(this.a, 0, 255);
    };

    /**
     * @method fromHEX
     * @param {string} hexString
     * @return {Color}
     * @chainable
     */
    Color.prototype.fromHEX = function (hexString) {
        var hex = parseInt(((hexString.indexOf('#') > -1) ? hexString.substring(1) : hexString), 16);
        this.r = (hex >> 16);
        this.g = ((hex & 0x00FF00) >> 8);
        this.b = ((hex & 0x0000FF));
        return this;
    };

    /**
     * @method toHEX
     * @param {string} fmt - "#rgb" or "#rrggbb"
     * @return {string}
     */
    Color.prototype.toHEX = function ( fmt ) {
        var hex = [
            (this.r | 0 ).toString(16),
            (this.g | 0 ).toString(16),
            (this.b | 0 ).toString(16),
        ];
        var i = -1;
        if ( fmt === '#rgb' ) {
            for ( i = 0; i < hex.length; ++i ) {
                if ( hex[i].length > 1 ) {
                    hex[i] = hex[i][0];
                }
            }
        }
        else if ( fmt === '#rrggbb' ) {
            for ( i = 0; i < hex.length; ++i ) {
                if ( hex[i].length === 1 ) {
                    hex[i] = '0' + hex[i];
                }
            }
        }
        return hex.join('');
    };

    /**
     * Convert to 24bit rgb value
     * @method toRGBValue
     * @return {number}
     */
    Color.prototype.toRGBValue = function () {
        return (cc.clampf(this.r, 0, 255) << 16) +
               (cc.clampf(this.g, 0, 255) << 8) +
               (cc.clampf(this.b, 0, 255));
    };

    /**
     * @method fromHSV
     * @param {number} h
     * @param {number} s
     * @param {number} v
     * @return {Color}
     * @chainable
     */
    Color.prototype.fromHSV = function ( h, s, v ) {
        var rgb = Color.hsv2rgb( h, s, v );
        this.r = rgb.r;
        this.g = rgb.g;
        this.b = rgb.b;
        return this;
    };

    /**
     * @method toHSV
     * @return {object} - {h: number, s: number, v: number}
     */
    Color.prototype.toHSV = function () {
        return Color.rgb2hsv( this.r, this.g, this.b );
    };

    return Color;
})();

/**
 * @param {Number} r - red, must be [0, 255]
 * @param {Number} g - red, must be [0, 255]
 * @param {Number} b - red, must be [0, 255]
 * @return {Object} - {h: number, s: number, v: number}
 * @function
 */
Color.rgb2hsv = function ( r, g, b ) {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    var hsv = { h: 0, s: 0, v: 0 };
    var max = Math.max(r,g,b);
    var min = Math.min(r,g,b);
    var delta = 0;
    hsv.v = max;
    hsv.s = max ? (max - min) / max : 0;
    if (!hsv.s) hsv.h = 0;
    else {
        delta = max - min;
        if (r === max) hsv.h = (g - b) / delta;
        else if (g === max) hsv.h = 2 + (b - r) / delta;
        else hsv.h = 4 + (r - g) / delta;
        hsv.h /= 6;
        if (hsv.h < 0) hsv.h += 1.0;
    }
    return hsv;
};

/**
 * @param {Number} h
 * @param {Number} s
 * @param {Number} v
 * @return {Object} - {r: number, g: number, b: number}}, rgb will be in [0, 255]
 * @function
 */
Color.hsv2rgb = function ( h, s, v ) {
    var rgb = { r: 0, g: 0, b: 0 };
    if (s === 0) {
        rgb.r = rgb.g = rgb.b = v;
    }
    else {
        if (v === 0) {
            rgb.r = rgb.g = rgb.b = 0;
        }
        else {
            if (h === 1) h = 0;
            h *= 6;
            s = s;
            v = v;
            var i = Math.floor(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - (s * f));
            var t = v * (1 - (s * (1 - f)));
            switch (i) {
                case 0:
                    rgb.r = v;
                    rgb.g = t;
                    rgb.b = p;
                    break;

                case 1:
                    rgb.r = q;
                    rgb.g = v;
                    rgb.b = p;
                    break;

                case 2:
                    rgb.r = p;
                    rgb.g = v;
                    rgb.b = t;
                    break;

                case 3:
                    rgb.r = p;
                    rgb.g = q;
                    rgb.b = v;
                    break;

                case 4:
                    rgb.r = t;
                    rgb.g = p;
                    rgb.b = v;
                    break;

                case 5:
                    rgb.r = v;
                    rgb.g = p;
                    rgb.b = q;
                    break;
            }
        }
    }
    rgb.r *= 255;
    rgb.g *= 255;
    rgb.b *= 255;
    return rgb;
};

cc.Color = Color;

/**
 * The convenience method to create a new <% crosslink cc.Color color %>
 * @example
 *
 * // 1. All channels seperately as parameters
 * var color1 = cc.color(255, 255, 255, 255);
 *
 * // 2. Convert a hex string to a color
 * var color2 = cc.color("#000000");
 *
 * // 3. An color object as parameter
 * var color3 = cc.color({r: 255, g: 255, b: 255, a: 255});
 *
 * Alpha channel is optional. Default value is 255
 * @method color
 * @param {number} [r=0]
 * @param {number} [g=0]
 * @param {number} [b=0]
 * @param {number} [a=255]
 * @return {Color}
 */
cc.color = function color (r, g, b, a) {
    if (r === undefined) {
        return new cc.Color(0, 0, 0, 255);
    }
    if (JS.isString(r)) {
        var result = new cc.Color();
        return result.fromHEX(r);
    }
    if (cc.isObject(r)) {
        return new cc.Color(r.r, r.g, r.b, r.a);
    }
    return  new cc.Color(r, g, b, a);
};


// Functional style API, for backward compatibility

/**
 * returns true if both ccColor3B are equal. Otherwise it returns false.
 * @function
 * @param {cc.Color} color1
 * @param {cc.Color} color2
 * @return {Boolean}  true if both ccColor3B are equal. Otherwise it returns false.
 */
cc.colorEqual = function (color1, color2) {
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
};

/**
 * convert a string of color for style to Color.
 * e.g. "#ff06ff"  to : cc.color(255,6,255)
 * @function
 * @param {String} hex
 * @return {cc.Color}
 */
cc.hexToColor = function (hex) {
    hex = hex.replace(/^#?/, "0x");
    var c = parseInt(hex);
    var r = (c >> 16);
    var g = ((c & 0x00FF00) >> 8);
    var b = ((c & 0x0000FF));
    return cc.color(r, g, b);
};

/**
 * convert Color to a string of color for style.
 * e.g.  cc.color(255,6,255)  to : "#ff06ff"
 * @function
 * @param {cc.Color} color
 * @return {String}
 */
cc.colorToHex = function (color) {
    var hR = color.r.toString(16), hG = color.g.toString(16), hB = color.b.toString(16);
    return "#" + (color.r < 16 ? ("0" + hR) : hR) + (color.g < 16 ? ("0" + hG) : hG) + (color.b < 16 ? ("0" + hB) : hB);
};