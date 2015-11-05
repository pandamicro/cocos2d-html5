
var AnimationClip = cc.Class({
    name: 'cc.AnimationClip',
    extends: cc.Asset,

    properties: {
        _name: {
            default: ''
        },
        name: {
            get: function () { return this._name; }
        },
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

    addProperty: function ( propName, compName, path ) {
        var curves = this.getCurveInfo(compName, path, true);

        if (!curves[propName]) {
            curves[propName] = [];
        }

        return curves[propName];
    },

    removeProperty: function ( propName, compName, path ) {
        var curves = this.getCurveInfo(compName, path);
        if (curves) {
            delete curves[propName];
        }
    },

    getCurveInfo: function ( compName, path, createData ) {
        var curveData = this.curveData;
        var target, curves;

        if (!path) {
            target = curveData;
        }
        else {
            if (!curveData.paths) {
                if (createData) curveData.paths = {};
                else return null;
            }
            if (!curveData.paths[path]) {
                if (createData) curveData.paths[path] = {};
                else return null;
            }
            target = curveData.paths[path];
        }

        if (!compName) {
            if (!target.props) {
                if (createData) target.props = {};
                else return null;
            }
            curves = target.props;
        }
        else {
            if (!target.comps) {
                if (createData) target.comps = {};
                else return null;
            }
            curves = target.comps;
        }

        return curves;
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
