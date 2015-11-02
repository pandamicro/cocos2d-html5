
var AnimationClip = cc.Class({
    name: 'Fire.AnimationClip',
    extends: cc.Asset,

    properties: {
        _length: {
            default: 0,
            type: 'Float',
        },
        length: {
            get: function () { return this._length; },
        },
        frameRate: {
            default: 60,
        },
        curveData: {
            default: [],
            visible: false,
        },
        events: {
            default: [],
            visible: false,
        },
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
    // [
    //     {
    //         property: 'hello', keys: [
    //             { frame: 0, value: 10, curve: [0,0.5,0.5,1] },
    //             { frame: 5, value: 15, curve: [0.5,0.5,0.5,0.5] },
    //             { frame: 10, value: 20, curve: null },
    //         ]
    //     },
    //     {
    //         component: 'foobar', property: 'world', keys: [
    //             { frame: 0, value: 10, curve: [0,0.5,0.5,1] },
    //             { frame: 5, value: 15, curve: [0.5,0.5,0.5,0.5] },
    //             { frame: 10, value: 20, curve: null },
    //         ]
    //     },
    // ]
});

Fire.AnimationClip = module.exports = AnimationClip;
