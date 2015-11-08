
var AnimationClip = cc.Class({
    name: 'cc.AnimationClip',
    extends: cc.Asset,

    properties: {
        _duration: {
            default: 0,
            type: 'Float',
        },
        duration: {
            get: function () { return this._duration; },
        },
        sample: {
            default: 60,
        },
        speed: {
            default: 1
        },
        wrapMode: {
            default: cc.WrapMode.Normal
        },
        curveData: {
            default: {},
            visible: false,
        },
        events: {
            default: [],
            visible: false,
        }
    },

    // curveData structure:
    // {
    //     // 根节点不用查找路径

    //     // root properties
    //     props: {
    //         x: [
    //             { frame: 0, value: 0, curve: [0,0.5,0.5,1] },
    //             { frame: 1, value: 200, curve: null }
    //         ]
    //     },

    //     comps: {
    //         // component
    //         'comp-1': {
    //             // component properties
    //             'prop-1': [
    //                 { frame: 0, value: 10, curve: [0,0.5,0.5,1] },
    //                 { frame: 1, value: 20, curve: null }
    //             ]
    //         }
    //     },

    //     paths: {
    //         // key 为节点到root的路径名, 通过cc.find找到
    //         'foo/bar': {
    //             // node properties
    //             props: {
    //                 x: [
    //                     { frame: 0, value: 0, curve: [0,0.5,0.5,1] },
    //                     { frame: 1, value: 200, curve: null }
    //                 ]
    //             },

    //             comps: {
    //                 // component
    //                 'comp-1': {
    //                     // component property
    //                     'prop-1': [
    //                         { frame: 0, value: 10, curve: [0,0.5,0.5,1] },
    //                         { frame: 1, value: 20, curve: null }
    //                     ]
    //                 }
    //             }
    //         }
    //     }
    // }

});

cc.AnimationClip = module.exports = AnimationClip;
