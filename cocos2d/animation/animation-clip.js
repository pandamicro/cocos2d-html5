
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
        curveData: {
            default: [],
            visible: false,
        },
        events: {
            default: [],
            visible: false,
        }
    },

    addProperty: function ( compName, propName ) {
        var result = this.curveData.some( function ( item ) {
            return item.component === compName && item.property === propName;
        });
        if ( !result ) {
            this.curveData.push({
                component: compName,
                property: propName,
                keys: [],
            });
        }
    },

    removeProperty: function ( compName, propName ) {
        for ( var i = 0; i < this.curveData.length; ++i ) {
            var curveInfo = this.curveData[i];
            if ( curveInfo.component === compName &&
                 curveInfo.property === propName ) {
                this.curveData.splice( i, 1 );
                break;
            }
        }
    },

    getCurveInfo: function ( compName, propName ) {
        for ( var i = 0; i < this.curveData.length; ++i ) {
            var curveInfo = this.curveData[i];
            if ( curveInfo.component === compName &&
                 curveInfo.property === propName ) {
                return curveInfo;
            }
        }
        return null;
    },

    sort: function () {
        this.curveData.sort( function ( a, b ) {
            if ( a.component !== b.component ) {
                return a.component.localeCompare(b.component);
            }
            return a.property.localeCompare( b.property );
        });
    },

    // curveData structure:
    // {
    //     // key 为节点到root的路径名, 通过cc.find找到
    //     'foo': [
    //         // component 属性
    //         {
    //             component: 'foobar', property: 'hello', keys: [
    //                 // frame 存的是时间
    //                 { frame: 0, value: 10, curve: [0,0.5,0.5,1] },
    //                 { frame: 0.5, value: 15, curve: [0.5,0.5,0.5,0.5] },
    //                 { frame: 1, value: 20, curve: null },
    //             ]
    //         },

    //         // 没有component关键字的则是 Node 属性
    //         {
    //             property: 'x', keys: [
    //                 { frame: 0, value: 0, curve: [0,0.5,0.5,1] },
    //                 { frame: 0.5, value: 100, curve: [0.5,0.5,0.5,0.5] },
    //                 { frame: 1, value: 200, curve: null },
    //             ]
    //         }
    //     ],

    //     'foo/bar': [
    //         // component 属性
    //         {
    //             component: 'foobar', property: 'hello', keys: [
    //                 // frame 存的是时间
    //                 { frame: 0, value: 10, curve: [0,0.5,0.5,1] },
    //                 { frame: 0.5, value: 15, curve: [0.5,0.5,0.5,0.5] },
    //                 { frame: 1, value: 20, curve: null },
    //             ]
    //         },

    //         // 没有component关键字的则是 Node 属性
    //         {
    //             property: 'x', keys: [
    //                 { frame: 0, value: 0, curve: [0,0.5,0.5,1] },
    //                 { frame: 0.5, value: 100, curve: [0.5,0.5,0.5,0.5] },
    //                 { frame: 1, value: 200, curve: null },
    //             ]
    //         }
    //     ]
    // }

});

cc.AnimationClip = module.exports = AnimationClip;
