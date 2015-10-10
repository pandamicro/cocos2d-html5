/**
 * @module Fire.Runtime
 */

var JS = cc.js;
var Vec2 = cc.Vec2;
var Rect = cc.Rect;
var Utils = require('./utils');
var NYI = Utils.NYI;
var NYI_Accessor = Utils.NYI_Accessor;
var NIL = Utils.NIL;

var INVISIBLE = {
    visible: false
};

var ERR_NaN = 'The %s must not be NaN';

/**
 * !#zh: 这个类用来封装编辑器针对节点的操作。
 * Note: 接口中以 "N" 结尾的使用的都是 Runtime 的原生 Node 类型。
 * !#en: This is a wrapper class for operating node with editor script
 * The instance of this class is a wrapper, not a node.
 * You can use `cc(node)` to get the wrapper if you really want to
 * use these API on runtime nodes.
 * Note: API that has a suffix "N" return Runtime's native Node type
 *
 * You should override:
 * - createEmpty (static)
 * - name
 * - parentN
 * - childrenN
 * - position
 * - worldPosition
 * - rotation
 * - worldRotation
 * - scale
 * - worldScale
 * - getWorldBounds
 * - getWorldOrientedBounds
 * - transformPoints
 * - inverseTransformPoints
 * - onBeforeSerialize (so that the node's properties can be serialized in wrapper)
 * - createNode
 *
 * You may want to override:
 * - animatableInEditor (static)
 * - setSiblingIndex
 * - getSiblingIndex
 * - x
 * - y
 * - worldX
 * - worldY
 * - scaleX
 * - scaleY
 * - scenePosition
 * - attached
 * - retain
 * - release
 * - onFocusInEditor
 * - onLostFocusInEditor
 *
 * @class NodeWrapper
 * @constructor
 * @param {RuntimeNode} node
 */
var NodeWrapper = cc.FireClass({
    name: 'Fire.Runtime.NodeWrapper',
    extends: cc.Object,

    constructor: function () {
        /**
         * The targetN node to wrap.
         * @property targetN
         * @type {RuntimeNode}
         */
        this.targetN = arguments[0];
        if (this.targetN) {
            if (CC_EDITOR) {
                var uuid = this.uuid;
                if (uuid) {
                    Fire.engine.attachedWrappersForEditor[uuid] = this;
                }
            }
            this.attached();
        }

        this.gizmo = null;
        this.mixinGizmos = [];

        //if (CC_EDITOR && !this.targetN) {
        //    cc.warn('targetN of %s must be non-nil', JS.getClassName(this));
        //}
    },

    properties: {
        ///**
        // * The class ID of attached script.
        // * @property mixinId
        // * @type {string|string[]}
        // * @default ""
        // */
        //mixinId: {
        //    default: "",
        //    visible: false
        //},

        /**
         * The name of the node.
         * @property name
         * @type {string}
         */
        name: {
            get: function () {
                return '';
            },
            set: function (value) {
            }
        },

        /**
         * uuid
         * @property _id
         * @type {string}
         * @private
         */
        _id: {
            default: '',
            editorOnly: true
        },

        /**
         * !#en the UUID, must be type string, editor only
         * !#zh 节点的 UUID，是字符串类型，只能在编辑器里用
         * @property uuid
         * @type {string}
         * @readOnly
         */
        uuid: {
            get: function () {
                return this._id || (this._id = Editor.uuid());
            },
            visible: false
        },

        /**
         * The PrefabInfo object
         * @property _prefab
         * @type {PrefabInfo}
         * @private
         */
        _prefab: {
            default: null,
            editorOnly: true
        },

        // HIERARCHY

        /**
         * The runtime parent of the node.
         * If this is the top most node in hierarchy, the wrapper of its parent must be type SceneWrapper.
         * Changing the parent will keep the transform's local space position, rotation and scale the same but modify
         * the world space position, scale and rotation.
         * @property parentN
         * @type {RuntimeNode}
         */
        parentN: NYI_Accessor(null, INVISIBLE, CC_EDITOR && 'parentN'),

        /**
         * Returns the array of children. If no child, this method should return an empty array.
         * The returns array can be modified ONLY in setSiblingIndex.
         * @property childrenN
         * @type {RuntimeNode[]}
         * @readOnly
         */
        childrenN: NYI_Accessor([], INVISIBLE, true, CC_EDITOR && 'childrenN'),

        // TRANSFORM

        /**
         * The local position in its parent's coordinate system
         * @property position
         * @type {cc.Vec2}
         */
        position: NYI_Accessor(Vec2.zero, CC_EDITOR && 'position'),

        /**
         * The local x position in its parent's coordinate system
         * @property x
         * @type {number}
         */
        x: {
            get: function () {
                return this.position.x;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.position;
                    p.x = value;
                    this.position = p;
                }
                else {
                    cc.error(ERR_NaN, 'new x');
                }
            },
            visible: false
        },

        /**
         * The local y position in its parent's coordinate system
         * @property y
         * @type {number}
         */
        y: {
            get: function () {
                return this.position.y;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.position;
                    p.y = value;
                    this.position = p;
                }
                else {
                    cc.error(ERR_NaN, 'new y');
                }
            },
            visible: false
        },

        /**
         * The position of the transform in world space
         * @property worldPosition
         * @type {cc.Vec2}
         */
        worldPosition: NYI_Accessor(Vec2.zero, INVISIBLE),

        /**
         * The x position of the transform in world space
         * @property worldX
         * @type {number}
         */
        worldX: {
            get: function () {
                return this.worldPosition.x;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.worldPosition;
                    p.x = value;
                    this.worldPosition = p;
                }
                else {
                    cc.error(ERR_NaN, 'new worldX');
                }
            },
            visible: false
        },

        /**
         * The y position of the transform in world space
         * @property worldY
         * @type {number}
         */
        worldY: {
            get: function () {
                return this.worldPosition.y;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.worldPosition;
                    p.y = value;
                    this.worldPosition = p;
                }
                else {
                    cc.error(ERR_NaN, 'new worldY');
                }
            },
            visible: false
        },

        /**
         * The clockwise degrees of rotation relative to the parent
         * @property rotation
         * @type {number}
         */
        rotation: NYI_Accessor(0, CC_EDITOR && {
            tooltip: "The clockwise degrees of rotation relative to the parent"
        }, CC_EDITOR && 'rotation'),

        /**
         * The clockwise degrees of rotation in world space
         * @property worldRotation
         * @type {number}
         */
        worldRotation: NYI_Accessor(0, INVISIBLE, CC_EDITOR && 'worldRotation'),

        /**
         * The local scale factor relative to the parent
         * @property scale
         * @type {cc.Vec2}
         */
        scale: NYI_Accessor(Vec2.one, CC_EDITOR && 'scale'),

        /**
         * The local x scale factor relative to the parent
         * @property scaleX
         * @type {number}
         */
        scaleX: {
            get: function () {
                return this.scale.x;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.scale;
                    p.x = value;
                    this.scale = p;
                }
                else {
                    cc.error(ERR_NaN, 'new scaleX');
                }
            },
            visible: false
        },

        /**
         * The local y scale factor relative to the parent
         * @property scaleY
         * @type {number}
         */
        scaleY: {
            get: function () {
                return this.scale.y;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var p = this.scale;
                    p.y = value;
                    this.scale = p;
                }
                else {
                    cc.error(ERR_NaN, 'new scaleY');
                }
            },
            visible: false
        },

        /**
         * The lossy scale of the transform in world space (Read Only)
         * @property worldScale
         * @type {cc.Vec2}
         * @readOnly
         */
        worldScale: NYI_Accessor(Vec2.one, INVISIBLE, true, CC_EDITOR && 'worldScale'),

        root: {
            get: function () {
                var node = this;
                var next = node.parent;
                while (next) {
                    node = next;
                    next = next.parent;
                }
                return node;
            }
        }
    },

    statics: {
        ///**
        // * Creates a new node without any resources.
        // * @method createEmpty
        // * @return {RuntimeNode}
        // * @static
        // */
        //createEmpty: function () {
        //    if (CC_EDITOR) {
        //        cc.error('Not yet implemented');
        //    }
        //    return null;
        //}

        /**
         * If true, the engine will keep updating this node in 60 fps when it is selected,
         * otherwise, it will update only if necessary
         * @property {Boolean} animatableInEditor
         * @default false
         * @static
         */
        animatableInEditor: false,

        /**
         * If false, Hierarchy will disallow to drag child into this node, and all children will be hidden.
         * @property {Boolean} canHaveChildrenInEditor
         * @default true
         * @static
         */
        canHaveChildrenInEditor: true
    },

    // SERIALIZATION

    /**
     * Creates a new node using the properties defined in this wrapper, the properties will be serialized in the scene.
     * Note: 不需要设置新节点的父子关系，也不需要设置 wrapper 的 targetN 为新节点.
     * @method createNode
     * @param {RuntimeNode} [node] - if supplied, initialize the node by using this wrapper
     * @return {RuntimeNode} - the created node or just return the given node
     */
    createNode: function (node) {
        if (CC_EDITOR) {
            NYI('createNode');
        }
        return null;
    },

    /**
     * 这个方法会在场景保存前调用，你可以将 node 的属性保存到 wrapper 的可序列化的 properties 中，
     * 以便在 createNode() 方法中重新设置好 node。
     * @method onBeforeSerialize
     */
    onBeforeSerialize: function () {
    },

    /**
     * Creates a new node and bind with this wrapper.
     * @method createAndAttachNode
     */
    createAndAttachNode: function () {
        var node = this.createNode();
        this.targetN = node;
        node._FB_wrapper = this;
        if (CC_EDITOR) {
            var uuid = this.uuid;
            if (uuid) {
                Fire.engine.attachedWrappersForEditor[uuid] = this;
            }
        }
        this.attached();
    },

    /**
     * Invoked after the wrapper's targetN is assigned. Override this method if you need to initialize your node.
     * @method attached
     */
    attached: function () {
    },

    ///**
    // * This method is called when the scene is saving, allowing you to return JSON to represent the state of your node.
    // * When the scene is later loaded, the data you returned is passed to the wrapper's deserialize method so you can
    // * restore the node.
    // * @method serialize
    // * @return {object} - a JSON represents the state of the targetN node
    // */
    //serialize: function (data) {
    //    if (CC_EDITOR) {
    //        cc.error('Not yet implemented');
    //    }
    //    return null;
    //},
    //
    ///**
    // * @callback deserializeCallback
    // * @param {string} error - null or the error info
    // * @param {RuntimeNode} node - the loaded node or null
    // */
    //
    ///**
    // * Creates a new node using the state data from the last time the scene was serialized if the wrapper implements the serialize() method.
    // * @method deserializeAsync
    // * @param {object} data - the JSON data returned from serialize() method
    // * @param {deserializeCallback} callback - Should not being called in current tick.
    // *                                         If there's no async operation, use Fire.nextTick to simulate.
    // */
    //deserializeAsync: function (data, callback) {
    //    Fire.nextTick(callback, 'Not yet implemented', null);
    //},

    ///**
    // * Creates a new node using the state data from the last time the scene was serialized if the wrapper implements the serialize() method.
    // * @method deserialize
    // * @param {object} data - the JSON data returned from serialize() method
    // * @return {RuntimeNode}
    // */
    //deserialize: function (data) {
    //    if (CC_EDITOR) {
    //        cc.error('Not yet implemented');
    //    }
    //    return null;
    //},

    // HIERARCHY

    /**
     * Get the sibling index.
     *
     * NOTE: If this node does not have parent and not belongs to the current scene,
     *       The return value will be -1
     *
     * @method getSiblingIndex
     * @return {number}
     */
    getSiblingIndex: function () {
        return cc(this.parentN).childrenN.indexOf(this.targetN);
    },

    /**
     * Set the sibling index of this node.
     * (值越小越先渲染，-1 代表最后一个)
     *
     * @method setSiblingIndex
     * @param {number} index - new zero-based index of the node, -1 will move to the end of children.
     */
    setSiblingIndex: function (index) {
        var siblings = cc(this.parentN).childrenN;
        var item = this.targetN;
        index = index !== -1 ? index : siblings.length - 1;
        var oldIndex = siblings.indexOf(item);
        if (index !== oldIndex) {
            siblings.splice(oldIndex, 1);
            if (index < siblings.length) {
                siblings.splice(index, 0, item);
            }
            else {
                siblings.push(item);
            }
        }
    },

    // TRANSFORM

    /**
     * Rotates this transform through point in world space by angle degrees.
     * @method rotateAround
     * @param {cc.Vec2} point - the world point rotates through
     * @param {number} angle - degrees
     */
    rotateAround: function (point, angle) {
        var delta = this.worldPosition.subSelf(point);
        delta.rotateSelf(angle * cc.RAD);
        this.worldPosition = point.addSelf(delta);
        this.rotation += angle;
    },

    /**
     * Transforms position from local space to world space.
     * @method transformPointToWorld
     * @param {Vec2} point
     * @return {Vec2}
     */
    transformPointToWorld: CC_EDITOR ? NIL : NYI.bind('transformPointToWorld'),

    /**
     * Transforms position from local space to world space.
     * @method transformPointToLocal
     * @param {Vec2} point
     * @return {Vec2}
     */
    transformPointToLocal: CC_EDITOR ? NIL : NYI.bind('transformPointToLocal'),

    // RENDERER

    /**
     * Returns a "world" axis aligned bounding box(AABB) of the renderer.
     *
     * @method getWorldBounds
     * @param {cc.Rect} [out] - optional, the receiving rect
     * @return {cc.Rect} - the rect represented in world position
     */
    getWorldBounds: function (out) {
        if (CC_EDITOR) {
            NYI('getWorldBounds');
        }
        return new Rect();
    },

    /**
     * Returns a "world" oriented bounding box(OBB) of the renderer.
     *
     * @method getWorldOrientedBounds
     * @param {cc.Vec2} [out_bl] - optional, the vector to receive the world position of bottom left
     * @param {cc.Vec2} [out_tl] - optional, the vector to receive the world position of top left
     * @param {cc.Vec2} [out_tr] - optional, the vector to receive the world position of top right
     * @param {cc.Vec2} [out_br] - optional, the vector to receive the world position of bottom right
     * @return {cc.Vec2} - the array contains vectors represented in world position,
     *                    in the sequence of BottomLeft, TopLeft, TopRight, BottomRight
     */
    getWorldOrientedBounds: function (out_bl, out_tl, out_tr, out_br){
        if (CC_EDITOR) {
            NYI('getWorldOrientedBounds');
        }
        return [Vec2.zero, Vec2.zero, Vec2.zero, Vec2.zero];
    },

    // MISC

    /**
     * Retains the ownership for JSB runtime.
     * This increases the target node's reference count.
     * @method retain
     */
    retain: function () {},

    /**
     * Releases the ownership immediately for JSB runtime.
     * This decrements the target node's reference count.
     * @method release
     */
    release: function () {},

    // EDITOR

    /**
     * @method onFocusInEditor
     */
    onFocusInEditor: null,

    /**
     * @method onLostFocusInEditor
     */
    onLostFocusInEditor: null,
});

cc._setWrapperGetter(function (node) {
    if (node instanceof NodeWrapper) {
        cc.warn('Fire accept argument of type runtime node, not wrapper.');
        return node;
    }
    if (!node) {
        return null;
    }
    var wrapper = node._FB_wrapper;
    if (!wrapper) {
        var Wrapper = Fire.getWrapperType(node);
        if (!Wrapper) {
            var getClassName = cc.js.getClassName;
            cc.error('%s not registered for %s', getClassName(NodeWrapper), getClassName(node));
            return null;
        }
        wrapper = new Wrapper(node);
        node._FB_wrapper = wrapper;
    }
    return wrapper;
});

module.exports = NodeWrapper;
