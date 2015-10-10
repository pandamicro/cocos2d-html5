/**
 * @module Fire
 */

var getChildrenN = function (node) {
    var wrapper = cc(node);
    var childrenN = wrapper.childrenN;
    var canHaveChildren = wrapper.constructor.canHaveChildrenInEditor;

    return {
        name: wrapper.name,
        id: wrapper.uuid,
        children: (canHaveChildren && childrenN.length > 0) ? childrenN.map(getChildrenN) : null,
        canHaveChildren: canHaveChildren ? undefined : false,
        isPrefab: wrapper._prefab ? true : undefined,
    };
};

/**
 * @method getHierarchyDump
 * @return {object[]}
 */
Editor.getHierarchyDump = function () {
    var root = Fire.engine.getCurrentSceneN();
    var children = cc(root).childrenN;
    return children.map(getChildrenN);
};

module.exports = Editor.getHierarchyDump;
