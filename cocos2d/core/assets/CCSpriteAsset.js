/**
 * Represents a Sprite object which obtained from Texture.
 * @class Sprite
 * @extends Asset
 * @constructor
 * @param {Image} [img] - Specify the html image element to render so you can create Sprite dynamically.
 */
var Sprite = cc.FireClass({

    name: 'cc.SpriteAsset',

    extends: cc.Asset,

    constructor: function () {
        var img = arguments[0];
        if (img) {
            this.texture = img.src;
            this.width = img.width;
            this.height = img.height;
        }
    },
    properties: {
        /**
         * @property pivot
         * @type Vec2
         * @default new cc.Vec2(0.5, 0.5)
         */
        pivot: {
            default: new cc.Vec2(0.5, 0.5),
            tooltip: 'The pivot is normalized, like a percentage.\n' +
                     '(0,0) means the bottom-left corner and (1,1) means the top-right corner.\n' +
                     'But you can use values higher than (1,1) and lower than (0,0) too.'
        },
        // trim info
        /**
         * @property trimX
         * @type number
         */
        trimX: {
            default: 0,
            type: 'Integer'
        },
        /**
         * @property trimY
         * @type number
         */
        trimY: {
            default: 0,
            type: 'Integer'
        },
        /**
         * @property width
         * @type number
         */
        width: {
            default: 0,
            type: 'Integer'
        },
        /**
         * @property height
         * @type number
         */
        height: {
            default: 0,
            type: 'Integer'
        },
        /**
         * @property texture
         * @type Texture
         */
        texture: {
            default: '',
            url: cc.TextureAsset,
            visible: false
        },
        /**
         * @property rotated
         * @type boolean
         * @default false
         */
        rotated: {
            default: false,
            visible: false
        },
        // raw texture info (used for texture-offset calculation)

        /**
         * uv of the sprite in atlas-texture
         * @property x
         * @type number
         */
        x: {
            default: 0,
            type: 'Integer',
            visible: false
        },
        /**
         * uv of the sprite in atlas-texture
         * @property y
         * @type number
         */
        y: {
            default: 0,
            type: 'Integer',
            visible: false
        },

        /**
         * @property rawWidth
         * @type number
         */
        rawWidth: {
            default: 0,
            type: 'Integer',
            visible: false
        },
        /**
         * @property rawHeight
         * @type number
         */
        rawHeight: {
            default: 0,
            type: 'Integer',
            visible: false
        },
        /**
         * Use pixel-level hit testing.
         * @property pixelLevelHitTest
         * @type boolean
         * @default false
         */
        pixelLevelHitTest: {
            default: false,
            tooltip: 'Use pixel-level hit testing.'
        },
        /**
         * The highest alpha channel value that is considered opaque for hit test. [0, 1]
         * @property alphaThreshold
         * @type number
         * @default 0.1
         */
        alphaThreshold: {
            default: 0.1,
            tooltip: 'The highest alpha channel value that is considered opaque for hit test.',
            watch: {
                'pixelLevelHitTest': function (obj, propEL) {
                    propEL.disabled = !obj.pixelLevelHitTest;
                }
            }
        },
        /**
         * Top border of the sprite
         * @property borderTop
         * @type number
         * @default 0
         */
        borderTop: {
            default: 0,
            type: 'Integer'
        },
        /**
         * Bottom border of the sprite
         * @property borderTop
         * @type number
         * @default 0
         */
        borderBottom: {
            default: 0,
            type: 'Integer'
        },
        /**
         * Left border of the sprite
         * @property borderTop
         * @type number
         * @default 0
         */
        borderLeft: {
            default: 0,
            type: 'Integer'
        },
        /**
         * Right border of the sprite
         * @property borderTop
         * @type number
         * @default 0
         */
        borderRight: {
            default: 0,
            type: 'Integer'
        },

        /**
         * @property rotatedWidth
         * @type number
         * @readOnly
         */
        rotatedWidth: {
            get: function () {
                return this.rotated ? this.height : this.width;
            }
        },

        /**
         * @property rotatedHeight
         * @type number
         * @readOnly
         */
        rotatedHeight: {
            get: function () {
                return this.rotated ? this.width : this.height;
            }
        }
    }
});

cc.SpriteAsset = Sprite;

module.exports = Sprite;
