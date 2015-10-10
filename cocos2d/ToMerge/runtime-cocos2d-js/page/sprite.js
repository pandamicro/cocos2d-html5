
var NodeWrapper = require('./node');

var SpriteWrapper = cc.FireClass({
    name: 'Runtime.SpriteWrapper',
    extends: NodeWrapper,

    properties: {

        _texture: {
            default: '',
            url: Fire.Texture
        },

        texture: {
            get: function () {
                var tex = this.targetN.texture;
                return (tex && tex.url) || '';
            },
            set: function (value) {
                this.targetN.texture = value;
            },
            url: Fire.Texture
        }
    },

    onBeforeSerialize: function () {
        NodeWrapper.prototype.onBeforeSerialize.call(this);
        this._texture = this.texture;
    },

    createNode: function (node) {
        node = node || new cc.Sprite();

        if (this._texture) {
            node.texture = this._texture;

            if (cc.sys.isNative) {
                // jsb Texture will not save url, so we save manually.
                node.texture.url = this._texture;
            }
        }

        NodeWrapper.prototype.createNode.call(this, node);

        return node;
    }
});

Runtime.SpriteWrapper = module.exports = SpriteWrapper;
