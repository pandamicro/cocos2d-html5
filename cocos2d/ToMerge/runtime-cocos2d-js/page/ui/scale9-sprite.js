
var Scale9Wrapper = require('./scale9');

var Scale9SpriteWrapper = cc.FireClass({
    name: 'Runtime.Scale9SpriteWrapper',
    extends: Scale9Wrapper,
    constructor: function () {
    },

    properties: {

        childrenN: {
            get: function () {
                var renderer = this.targetN.getVirtualRenderer();
                var children = this.targetN.children.filter( function (child) {
                    return child !== renderer;
                });
                return children;
            },
        },

        texture_: {
            get: function () {
                return this.texture;
            },
            set: function (value) {
                this.texture = value;
                this.targetN.loadTexture( value );
            },
            url: Fire.Texture
        },

        texture: {
            default: '',
            url: Fire.Texture,
            visible: false
        }
    },

    createNode: function (node) {
        node = node || new ccui.ImageView(this.texture);

        Scale9Wrapper.prototype.createNode.call(this, node);

        return node;
    }
});

// ccui.ImageView not implement getRotation
// we implement here
if (!cc.sys.isNative) {
    var _p = ccui.ImageView.prototype;
    _p.getRotation = function() {
        return this._imageRenderer.getRotation();
    };

    cc.defineGetterSetter(_p, 'rotation', _p.getRotation, _p.setRotation);
}

Runtime.Scale9SpriteWrapper = module.exports = Scale9SpriteWrapper;
