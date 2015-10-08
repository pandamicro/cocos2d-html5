
var Scale9Wrapper = require('./scale9');

var SliderWrapper = cc.FireClass({
    name: 'Runtime.SliderWrapper',
    extends: Scale9Wrapper,
    constructor: function () {
    },

    properties: {
        bgBar_: {
            get: function () {
                return this.bgBar;
            },
            set: function (value) {
                this.bgBar = value;
                this.targetN.loadBarTexture( value );
            },
            url: Fire.Texture,
            displayName: 'Bg Bar'
        },

        fgBar_: {
            get: function () {
                return this.fgBar;
            },
            set: function (value) {
                this.fgBar = value;
                this.targetN.loadProgressBarTexture( value );
            },
            url: Fire.Texture,
            displayName: 'Fg Bar'
        },

        control_: {
            get: function () {
                return this.control;
            },
            set: function (value) {
                this.control = value;
                this.targetN.loadSlidBallTextureNormal( value );
            },
            url: Fire.Texture,
            displayName: 'Control'
        },

        controlPressed_: {
            get: function () {
                return this.controlPressed;
            },
            set: function (value) {
                this.controlPressed = value;
                this.targetN.loadSlidBallTexturePressed( value );
            },
            url: Fire.Texture,
            displayName: 'Control Pressed'
        },

        controlDisabled_: {
            get: function () {
                return this.controlDisabled;
            },
            set: function (value) {
                this.controlDisabled = value;
                this.targetN.loadSlidBallTextureDisabled( value );
            },
            url: Fire.Texture,
            displayName: 'Control Disabled'
        },

        percent: {
            get: function () {
                return this.targetN.percent;
            },
            set: function (value) {
                if ( typeof value === 'number' && !isNaN(value) ) {
                    this.targetN.percent = value;
                }
                else {
                    cc.error('The new percent must be number');
                }
            }
        },

        _percent: {
            default: 0
        },

        bgBar: {
            default: '',
            url: Fire.Texture,
            visible: false
        },

        fgBar: {
            default: '',
            url: Fire.Texture,
            visible: false
        },

        control: {
            default: '',
            url: Fire.Texture,
            visible: false
        },

        controlPressed: {
            default: '',
            url: Fire.Texture,
            visible: false
        },

        controlDisabled: {
            default: '',
            url: Fire.Texture,
            visible: false
        },
    },

    onBeforeSerialize: function () {
        Scale9Wrapper.prototype.onBeforeSerialize.call(this);

        this._percent = this.percent;
    },

    createNode: function (node) {
        node = node || new ccui.Slider();

        node.loadBarTexture( this.bgBar );
        node.loadProgressBarTexture( this.fgBar );
        node.loadSlidBallTextures( this.control, this.controlPressed, this.controlDisabled );

        node.percent = this._percent;

        Scale9Wrapper.prototype.createNode.call(this, node);

        return node;
    }
});

Runtime.SliderWrapper = module.exports = SliderWrapper;
