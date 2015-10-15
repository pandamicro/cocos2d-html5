var SpriteAnimationAsset = cc.Class({
    name: 'cc.SpriteAnimationAsset',
    extends: cc.Asset,

    properties: {
        0: {
            default: '',
            url: cc.TextureAsset
        },

        1: {
            default: '',
            url: cc.TextureAsset
        },

        2: {
            default: '',
            url: cc.TextureAsset
        },

        3: {
            default: '',
            url: cc.TextureAsset
        },

        4: {
            default: '',
            url: cc.TextureAsset
        },

        5: {
            default: '',
            url: cc.TextureAsset
        },

        6: {
            default: '',
            url: cc.TextureAsset
        },

        7: {
            default: '',
            url: cc.TextureAsset
        },

        8: {
            default: '',
            url: cc.TextureAsset
        },

        9: {
            default: '',
            url: cc.TextureAsset
        },


        loop: {
            default: true
        },

        delay: {
            default: 0.5
        }
    },
});

cc.SpriteAnimationAsset = SpriteAnimationAsset;

module.exports = SpriteAnimationAsset;
