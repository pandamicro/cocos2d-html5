var SpriteAnimationAsset = cc.FireClass({
    name: 'Runtime.SpriteAnimationAsset',
    extends: cc.Asset,

    properties: {
        0: {
            default: '',
            url: Fire.Texture
        },

        1: {
            default: '',
            url: Fire.Texture
        },

        2: {
            default: '',
            url: Fire.Texture
        },

        3: {
            default: '',
            url: Fire.Texture
        },

        4: {
            default: '',
            url: Fire.Texture
        },

        5: {
            default: '',
            url: Fire.Texture
        },

        6: {
            default: '',
            url: Fire.Texture
        },

        7: {
            default: '',
            url: Fire.Texture
        },

        8: {
            default: '',
            url: Fire.Texture
        },

        9: {
            default: '',
            url: Fire.Texture
        },


        loop: {
            default: true
        },

        delay: {
            default: 0.5
        }
    },
});

Runtime.SpriteAnimationAsset = SpriteAnimationAsset;

module.exports = SpriteAnimationAsset;
