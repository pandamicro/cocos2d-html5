
var NodeWrapper = require('./node');

var LayerWrapper = cc.FireClass({
    name: 'Runtime.LayerWrapper',
    extends: NodeWrapper,
    constructor: function () {
    },

    properties: {
        bake: {
            default: false,

            notify: function (value) {
                if (!this.targetN) return;

                if (typeof value === 'boolean') {
                    if (value) {
                        this.targetN.bake();
                    }
                    else {
                        this.targetN.unbake();
                    }
                }
                else {
                    cc.error('The new bake must be boolean');
                }
            }
        }
    },

    createNode: function (node) {
        node = node || new cc.Layer();
        node.setAnchorPoint(0, 0);

        if (this.bake) {
            node.bake();
        }

        NodeWrapper.prototype.createNode.call(this, node);

        return node;
    }
});

Runtime.LayerWrapper = module.exports = LayerWrapper;
