
var NodeWrapper = require('./node');

var SpriteBatchNodeWrapper = cc.FireClass({
    name: 'Runtime.SpriteBatchNodeWrapper',
    extends: NodeWrapper,
    constructor: function () {
    },

    properties: {

        texture_: {
            get: function () {
                var tex = this.targetN.texture;
                return (tex && tex.url) || '';
            },
            set: function (value) {
                this.targetN.initWithFile(value);
            },
            url: Fire.Texture
        },

        texture: {
            default: '',
            url: Fire.Texture,
            visible: false
        },

        _textureObject: {
            default: null
        },
    },

    onBeforeSerialize: function () {
        NodeWrapper.prototype.onBeforeSerialize.call(this);

        this.texture = this.texture_;
        this._textureObject = this.targetN.texture;
    },

    createNode: function (node) {
        node = node || new cc.SpriteBatchNode(new cc.Texture2D());

        NodeWrapper.prototype.createNode.call(this, node);

        if (this.texture) {
            node.texture = cc.textureCache.addImage(this.texture);
        }
        else if (this._textureObject) {
            node.texture = this._textureObject;
        }

        return node;
    }
});

Runtime.SpriteBatchNodeWrapper = module.exports = SpriteBatchNodeWrapper;
