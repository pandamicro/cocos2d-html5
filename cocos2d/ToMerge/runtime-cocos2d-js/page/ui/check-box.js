
var WidgetWrapper = require('./widget');

var CheckBoxWrapper = cc.FireClass({
    name: 'Runtime.CheckBoxWrapper',
    extends: WidgetWrapper,

    constructor: function () {
    },

    properties: {
        bg_: {
            get: function () {
                return this.bg;
            },
            set: function ( value ) {
                this.bg = value;
                this.targetN.loadTextureBackGround( value );
            },
            url: Fire.Texture,
            displayName: 'Bg'
        },

        bgPressed_: {
            get: function () {
                return this.bgPressed;
            },
            set: function ( value ) {
                this.bgPressed = value;
                this.targetN.loadTextureBackGroundSelected( value );
            },
            url: Fire.Texture,
            displayName: 'Bg Pressed'
        },

        bgDisabled_: {
            get: function () {
                return this.bgDisabled;
            },
            set: function ( value ) {
                this.bgDisabled = value;
                this.targetN.loadTextureBackGroundDisabled( value );
            },
            url: Fire.Texture,
            displayName: 'Bg Disabled'
        },

        fg_: {
            get: function () {
                return this.fg;
            },
            set: function ( value ) {
                this.fg = value;
                this.targetN.loadTextureFrontCross( value );
            },
            url: Fire.Texture,
            displayName: 'Fg'
        },

        fgDisabled_: {
            get: function () {
                return this.fgDisabled;
            },
            set: function ( value ) {
                this.fgDisabled = value;
                this.targetN.loadTextureFrontCrossDisabled( value );
            },
            url: Fire.Texture,
            displayName: 'Fg Disabled'
        },

        selected: {
            get: function () {
                return this.targetN.selected;
            },
            set: function (value) {
                if (typeof value === 'boolean') {
                    this.targetN.selected = value;
                }
                else {
                    cc.error('The new selected must be number');
                }
            }
        },

        bg: {
            default: '',
            url: Fire.Texture,
            visible: false
        },

        bgPressed: {
            default: '',
            url: Fire.Texture,
            visible: false
        },

        bgDisabled: {
            default: '',
            url: Fire.Texture,
            visible: false
        },

        fg: {
            default: '',
            url: Fire.Texture,
            visible: false
        },

        fgDisabled: {
            default: '',
            url: Fire.Texture,
            visible: false
        },

        _selected: {
            default: null
        }

    },

    onBeforeSerialize: function () {
        WidgetWrapper.prototype.onBeforeSerialize.call(this);

        this._selected = this.selected;
    },

    createNode: function (node) {

        node = node || new ccui.CheckBox();
        node.loadTextures(this.bg, this.bgPressed, this.fg, this.bgDisabled, this.fgDisabled);

        if (this._selected !== null) {
            node.selected = this._selected;
        }

        WidgetWrapper.prototype.createNode.call(this, node);

        return node;
    }
});

Runtime.CheckBoxWrapper = module.exports = CheckBoxWrapper;
