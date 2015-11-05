/**
 * Represents a Sprite object which obtained from Texture.
 * @class SpriteAsset
 * @extends Asset
 * @constructor
 */
var Sprite = cc.Class({

    name: 'cc.SpriteAsset',

    extends: cc.Asset,

    //ctor: function () {
    //    var img = arguments[0];
    //    if (img) {
    //        this.texture = img.src;
    //        this.rawWidth = this.width = img.width;
    //        this.rawHeight = this.height = img.height;
    //    }
    //},

    properties: {

        /**
         * @property pivot
         * @type {cc.Vec2}
         * @default new cc.Vec2(0.5, 0.5)
         */
        pivot: {
            default: new cc.Vec2(0.5, 0.5),
            tooltip: 'The pivot is normalized, like a percentage.\n' +
                     '(0,0) means the bottom-left corner and (1,1) means the top-right corner.\n' +
                     'But you can use values higher than (1,1) and lower than (0,0) too.'
        },

        // LOCATION ON RENDERING TEXTURE

        /**
         * @property {Number} x - The location of the sprite on rendering texture
         */
        x: {
            default: 0,
            type: 'Integer',
            visible: false
        },

        /**
         * @property  {Number} y - The location of the sprite on rendering texture
         */
        y: {
            default: 0,
            type: 'Integer',
            visible: false
        },

        /**
         * @property {number} width - The width of the sprite on rendering texture (trimed width)
         */
        width: {
            default: 0,
            type: 'Integer'
        },

        /**
         * @property {number} height - The height of the sprite on rendering texture (trimed height)
         */
        height: {
            default: 0,
            type: 'Integer'
        },

        //

        /**
         * The texture url, will be serialized as texture's uuid.
         * @property texture
         * @type {String}
         */
        texture: {
            default: '',
            url: cc.Texture2D,
            visible: false
        },

        /**
         * @property rotated
         * @type {Boolean}
         * @default false
         */
        rotated: {
            default: false,
            visible: false
        },

        /**
         * @property {number} trimLeft - left offset of the sprite on the raw texture
         */
        trimLeft: {
            default: 0,
            type: 'Integer'
        },

        /**
         * @property {number} trimTop - top offset of the sprite on the raw texture
         */
        trimTop: {
            default: 0,
            type: 'Integer'
        },

        /**
         * @property {Number} rawWidth - the original width of the raw texture
         */
        rawWidth: {
            default: 0,
            type: 'Integer',
            visible: false
        },

        /**
         * @property {Number} rawHeight - the original height of the raw texture
         */
        rawHeight: {
            default: 0,
            type: 'Integer',
            visible: false
        },

        ///**
        // * Use pixel-level hit testing.
        // * @property pixelLevelHitTest
        // * @type {Boolean}
        // * @default false
        // */
        //pixelLevelHitTest: {
        //    default: false,
        //    tooltip: 'Use pixel-level hit testing.'
        //},
        //
        ///**
        // * The highest alpha channel value that is considered opaque for hit test. [0, 255]
        // * @property alphaThreshold
        // * @type {Number}
        // * @default 25
        // */
        //alphaThreshold: {
        //    default: 25,
        //    tooltip: 'The highest alpha channel value that is considered opaque for hit test.',
        //    //watch: {
        //    //    'pixelLevelHitTest': function (obj, propEL) {
        //    //        propEL.disabled = !obj.pixelLevelHitTest;
        //    //    }
        //    //}
        //},

        // BORDERS

        /**
         * Top border of the sprite
         * @property insetTop
         * @type {Number}
         * @default 0
         */
        insetTop: {
            default: 0,
            type: 'Integer'
        },

        /**
         * Bottom border of the sprite
         * @property insetBottom
         * @type {Number}
         * @default 0
         */
        insetBottom: {
            default: 0,
            type: 'Integer'
        },

        /**
         * Left border of the sprite
         * @property insetLeft
         * @type {Number}
         * @default 0
         */
        insetLeft: {
            default: 0,
            type: 'Integer'
        },

        /**
         * Right border of the sprite
         * @property insetRight
         * @type {Number}
         * @default 0
         */
        insetRight: {
            default: 0,
            type: 'Integer'
        },

        //

        /**
         * @property rotatedWidth
         * @type {Number}
         * @readOnly
         */
        rotatedWidth: {
            get: function () {
                return this.rotated ? this.height : this.width;
            }
        },

        /**
         * @property rotatedHeight
         * @type {Number}
         * @readOnly
         */
        rotatedHeight: {
            get: function () {
                return this.rotated ? this.width : this.height;
            }
        }
    }
});

cc.SpriteAsset = module.exports = Sprite;
