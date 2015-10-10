
var ScrollViewWrapper = require('./scroll-view');

var ListViewWrapper = cc.FireClass({
    name: 'Runtime.ListViewWrapper',
    extends: ScrollViewWrapper,

    createNode: function (node) {
        node = node || new ccui.ListView();

        ScrollViewWrapper.prototype.createNode.call(this, node);

        return node;
    }
});

Runtime.ListViewWrapper = module.exports = ListViewWrapper;
