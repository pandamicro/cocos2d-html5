var NodeWrapper = require('./node');

var DrawNodeWrapper = cc.FireClass({
    name: 'Runtime.DrawNodeWrapper',
    extends: NodeWrapper,

    properties: {},

    createNode: function(node){

        node = node || new cc.DrawNode();

        NodeWrapper.prototype.createNode.call(this, node);

        return node;
    }

});

Runtime.DrawNodeWrapper = module.exports = DrawNodeWrapper;