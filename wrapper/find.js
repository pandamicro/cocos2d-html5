var NodeWrapper = require('./wrappers/node');

/**
 * Finds a node by hierarchy path, the path is case-sensitive.
 * It will traverse the hierarchy by splitting the path using '/' character.
 * It is recommended to not use this function every frame instead cache the result at startup.
 *
 * @method find
 * @param {string} path
 * @param {RuntimeNode} referenceNode
 * @return {RuntimeNode} the node or null if not found
 */
module.exports = function (path, referenceNode) {
    if (path == null) {
        cc.error('Argument must be non-nil');
        return null;
    }
    if (!referenceNode) {
        var scene = cc.engine.getCurrentScene();
        if (!scene) {
            cc.warn('Can not get current scene.');
            return null;
        }
        referenceNode = scene;
    }
    else if (!(referenceNode instanceof NodeWrapper)) {
        referenceNode = cc(referenceNode)
    }

    var matchWrapper = referenceNode;
    var startIndex = (path[0] !== '/') ? 0 : 1; // skip first '/'
    var nameList = path.split('/');

    // parse path
    for (var n = startIndex; n < nameList.length; n++) {
        var name = nameList[n];
        var findByBeh = name[0] === '<' && name[name.length - 1] === '>';
        var beh;
        if (findByBeh) {
            var behName = name.slice(1, -1);
            beh = cc.js.getClassByName(behName);
            if (!beh) {
                cc.warn('Failed to find behavior ' + behName);
                return null;
            }
        }
        // visit sub nodes
        var children = matchWrapper.childrenN;
        matchWrapper = null;
        for (var t = 0, len = children.length; t < len; ++t) {
            var subWrapper = cc(children[t]);
            if (findByBeh) {
                if (cc.hasMixin(subWrapper, beh)) {
                    matchWrapper = subWrapper;
                    break;
                }
            }
            else if (subWrapper.name === name) {
                matchWrapper = subWrapper;
                break;
            }
        }
        if (!matchWrapper) {
            return null;
        }
    }

    return matchWrapper && matchWrapper.targetN;
};
