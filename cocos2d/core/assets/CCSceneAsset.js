var Scene = cc.FireClass({
    name: 'cc.SceneAsset',
    extends: cc.Asset,

    properties: {
        scene: null
    },
});

cc.SceneAsset = Scene;
module.exports = Scene;
