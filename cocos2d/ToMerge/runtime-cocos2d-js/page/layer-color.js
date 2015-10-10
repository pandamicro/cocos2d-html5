
var LayerWrapper = require('./layer');

var LayerColorWrapper = cc.FireClass({
    name: 'Runtime.LayerColorWrapper',
    extends: LayerWrapper,
    constructor: function () {
    },

    properties: {
    },

    createNode: function (node) {
        node = node || new cc.LayerColor();

        LayerWrapper.prototype.createNode.call(this, node);

        return node;
    }
});

Runtime.LayerColorWrapper = module.exports = LayerColorWrapper;
