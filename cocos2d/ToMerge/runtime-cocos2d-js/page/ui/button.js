
var Scale9Wrapper = require('./scale9');

var ButtonWrapper = cc.FireClass({
    name: 'Runtime.ButtonWrapper',
    extends: Scale9Wrapper,

    constructor: function () {
    },

    properties: {
        normalTexture: {
            get: function () {
                return this._normalTexture;
            },
            set: function ( value ) {
                this._normalTexture = value;
                this.targetN.loadTextureNormal( value );
            },
            url: Fire.Texture
        },

        pressedTexture: {
            get: function () {
                return this._pressedTexture;
            },
            set: function ( value ) {
                this._pressedTexture = value;
                this.targetN.loadTexturePressed( value );
            },
            url: Fire.Texture
        },

        disabledTexture: {
            get: function () {
                return this._disabledTexture;
            },
            set: function ( value ) {
                this._disabledTexture = value;
                this.targetN.loadTextureDisabled( value );
            },
            url: Fire.Texture
        },

        text: {
            get: function () {
                return this.targetN.titleText;
            },
            set: function (value) {
                if (typeof value === 'string') {
                    this.targetN.titleText = value;
                }
                else {
                    cc.error('The new text must be String');
                }
            }
        },

        fontSize: {
            get: function () {
                return this.targetN.titleFontSize;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    this.targetN.titleFontSize = value;
                }
                else {
                    cc.error('The new fontSize must not be NaN');
                }
            }
        },

        _font: {
            default: null,
            type: Fire.TTFFont,
            visible: true,

            notify: function () {
                var value = this._font;
                if (!value || value instanceof Fire.TTFFont) {
                    Runtime.setFontToNode(value, this.targetN);
                }
                else {
                    cc.error('The new font must be Fire.TTFFont');
                }
            }
        },

        fontFamily: {
            get: function () {
                return this.targetN.titleFontName;
            },
            set: function (value) {
                if (typeof value === 'string') {
                    this.targetN.titleFontName = value;
                }
                else {
                    cc.error('The new fontFamily must be String');
                }
            }
        },

        fontColor: {
            get: function () {
                var color = this.targetN.titleColor;
                return color ? cc.Color.fromCCColor(color) : cc.Color.white;
            },
            set: function (value) {
                if (value instanceof cc.Color) {
                    var color = value.toCCColor();
                    this.targetN.titleColor = color;
                }
                else {
                    cc.error('The new fontColor must be cc.Color');
                }
            },
        },

        _text: {
            default: 'Button'
        },

        _fontSize: {
            default: 16
        },

        _fontFamily: {
            default: null
        },

        _fontColor: {
            default: null
        },

        _normalTexture: {
            default: '',
            url: Fire.Texture
        },

        _pressedTexture: {
            default: '',
            url: Fire.Texture
        },

        _disabledTexture: {
            default: '',
            url: Fire.Texture
        }
    },

    onBeforeSerialize: function () {
        Scale9Wrapper.prototype.onBeforeSerialize.call(this);

        this._text = this.text;
        this._fontSize = this.fontSize;
        this._fontFamily = this.fontFamily;

        var color = this.fontColor;
        this._fontColor = [color.r, color.g, color.b, color.a];
    },

    createNode: function (node) {

        node = node || new ccui.Button();
        node.loadTextures(this._normalTexture, this._pressedTexture, this._disabledTexture);

        node.titleText = this._text;
        node.titleFontSize = this._fontSize;
        node.titleFontName = this._fontFamily === null ? node.titleFontName : this._fontFamily;

        Runtime.setFontToNode(this._font, node);

        var color = this._fontColor;
        if (color) {
            color = new cc.Color(this._fontColor[0], this._fontColor[1], this._fontColor[2], this._fontColor[3]);
            node.titleColor = color.toCCColor();
        }

        Scale9Wrapper.prototype.createNode.call(this, node);

        return node;
    }
});

Runtime.ButtonWrapper = module.exports = ButtonWrapper;
