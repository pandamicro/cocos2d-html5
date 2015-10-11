
var TTFFont = cc.FireClass({
    name: 'cc.TTFFont',
    extends: cc.Asset,

    properties: {
        fontFamily: {
            default: ''
        }
    },
});

cc.TTFFont = TTFFont;
module.exports = TTFFont;
