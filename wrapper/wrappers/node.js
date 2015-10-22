/**
 * @module cc.Runtime
 */

var JS = cc.js;
var Vec2 = cc.Vec2;
var Rect = cc.Rect;
var Color = cc.Color;
var Helpers = require('../helpers');

var ERR_NaN = 'The %s must not be NaN';

/**
 * !#zh: 这个类用来封装编辑器针对节点的操作。
 * Note: 接口中以 "N" 结尾的使用的都是 Runtime 的原生 Node 类型。
 * !#en: This is a wrapper class for operating node with editor script
 * The instance of this class is a wrapper, not a node.
 * You can use `cc.getWrapper(node)` to get the wrapper if you really want to
 * use these API on runtime nodes.
 * Note: API that has a suffix "N" return Runtime's native Node type
 *
 * @class NodeWrapper
 * @constructor
 * @param {RuntimeNode} node
 */
var NodeWrapper = cc.Class({
    name: 'cc.NodeWrapper',
    extends: cc.Object,

    ctor: function () {
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
                    cc.engine.attachedWrappersForEditor[uuid] = this;
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
                return this.targetN.getName();
            },
            set: function (value) {
                this.targetN.setName(value);
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
        parentN: {
            get: function () {
                return this.targetN.parent;
            },
            set: function (value) {
                var parent;
                var targetN = this.targetN;

                if (value) {
                    parent = cc.getWrapper(value);
                    if ( !parent.canAddChildN(targetN) ) return;
                }

                var oldParent = this.parent;

                if (oldParent) {
                    var cleanup = !value;
                    oldParent.removeChildN( targetN, cleanup );
                }

                if (parent) {
                    parent.addChildN(targetN);

                    // if set parent success
                    if (targetN.parent) {
                        this.setMaxOrder();

                        if (!oldParent) {
                            this.targetN.scheduleUpdateWithPriority(this.schedulePriority);
                        }
                    }
                }
            },
            visible: false
        },

        /**
         * Returns the array of children. If no child, this method should return an empty array.
         * The returns array can be modified ONLY in setSiblingIndex.
         * @property childrenN
         * @type {RuntimeNode[]}
         * @readOnly
         */
        childrenN: {
            get: function () {
                return this.targetN.children;
            },
            visible: false
        },

        // TRANSFORM

        /**
         * The local position in its parent's coordinate system
         * @property position
         * @type {cc.Vec2}
         */
        position: {
            get: function () {
                return new Vec2(this.targetN.x, this.targetN.y);
            },
            set: function (value) {
                if ( value instanceof Vec2 ) {
                    this.targetN.setPosition(value.x, value.y);
                }
                else {
                    cc.error('The new position must be cc.Vec2');
                }
            }
        },

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
        worldPosition: {
            get: function () {
                var pos = this.targetN.convertToWorldSpaceAR(cc.p(0,0));
                return new Vec2(pos.x, pos.y);
            },
            set: function (value) {
                if ( value instanceof Vec2 ) {
                    if ( this.parentN ) {
                        var p = this.parentN.convertToNodeSpace(value);
                        this.position = cc.v2(p.x, p.y);
                    }
                    else {
                        this.position = value;
                    }
                }
                else {
                    cc.error('The new worldPosition must be cc.Vec2');
                }
            },
            visible: false
        },

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
        rotation: {
            get: function () {
                return this.targetN.rotation;
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    this.targetN.rotation = value;
                }
                else {
                    cc.error('The new rotation must not be NaN');
                }
            },
            tooltip: "The clockwise degrees of rotation relative to the parent"
        },

        /**
         * The clockwise degrees of rotation in world space
         * @property worldRotation
         * @type {number}
         */
        worldRotation: {
            get: function () {
                var parent = this.parentN;
                if ( parent ) {
                    if ( parent instanceof cc.Scene ) {
                        return this.rotation + parent.rotation;
                    }
                    else {
                        return this.rotation + cc.getWrapper(parent).worldRotation;
                    }
                }
                else {
                    return this.rotation;
                }
            },
            set: function (value) {
                if ( !isNaN(value) ) {
                    var parent = this.parentN;
                    if ( parent ) {
                        if ( parent instanceof cc.Scene ) {
                            this.rotation = value - parent.rotation;
                        }
                        else {
                            this.rotation = value - cc.getWrapper(parent).worldRotation;
                        }
                    }
                    else {
                        this.rotation = value;
                    }
                }
                else {
                    cc.error('The new worldRotation must not be NaN');
                }
            },
            visible: false
        },

        /**
         * The local scale factor relative to the parent
         * @property scale
         * @type {cc.Vec2}
         */
        scale: {
            get: function () {
                return new Vec2(this.targetN.scaleX, this.targetN.scaleY);
            },
            set: function (value) {
                if ( value instanceof Vec2 ) {
                    this.targetN.scaleX = value.x;
                    this.targetN.scaleY = value.y;
                }
                else {
                    cc.error('The new scale must be cc.Vec2');
                }
            }
        },

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
        worldScale: {
            get: function () {
                var mat = this.targetN.getNodeToWorldTransform();

                var ret = new Vec2();
                ret.x = Math.sqrt(mat.a * mat.a + mat.b * mat.b);
                ret.y = Math.sqrt(mat.c * mat.c + mat.d * mat.d);

                return ret;
            },
            visible: false
        },

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
        },

        anchorPoint: {
            get: function () {
                return new Vec2(this.targetN.anchorX, this.targetN.anchorY);
            },
            set: function (value) {
                if ( value instanceof Vec2 ) {
                    this.targetN.setAnchorPoint(value.x, value.y);
                }
                else {
                    cc.error('The new anchorPoint must be cc.Vec2');
                }
            }
        },

        color: {
            get: function () {
                var color = this.targetN.color;
                color.a = this.targetN.opacity;
                return color;
            },
            set: function (value) {
                if (value instanceof Color) {
                    this.targetN.color = value;
                    this.targetN.opacity = value.a;
                }
                else {
                    cc.error('The new color must be cc.Color');
                }
            },
        },

        /**
         * The size of the node
         * @property size
         * @type {cc.Vec2}
         */
        size: {
            get: function () {
                var size = this.targetN.getContentSize();
                return new Vec2(size.width, size.height);
            },
            set: function (value) {
                if ( value instanceof Vec2 ) {
                    this.targetN.setContentSize(value.x, value.y);

                    if (this.onSizeChanged) this.onSizeChanged();
                }
                else {
                    cc.error('The new size must be cc.Vec2');
                }
            }
        },

        visible: {
            get: function () {
                return this.targetN.visible;
            },
            set: function (value) {
                if (typeof value === 'boolean') {
                    this.targetN.visible = value;
                }
                else {
                    cc.error('The new visible must be boolean')
                }
            }
        },

        _name: {
            default: ""
        },

        _position: {
            default: null
        },

        _scale: {
            default: null
        },

        _rotation: {
            default: 0
        },

        _size: {
            default: null
        },

        _color: {
            default: null
        },

        _anchorPoint: {
            default: null
        },

        _visible: {
            default: true
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
         * @property {Boolean} _60fpsInEditMode
         * @default false
         * @static
         */
        _60fpsInEditMode: false,

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
        node = node || new cc.Node();

        node.setName(this._name);
        node.rotation = this._rotation;
        node.visible = this._visible;

        if (this._size) {
            node.setContentSize(this._size[0], this._size[1]);
        }

        if (this._position) {
            node.x = this._position[0];
            node.y = this._position[1];
        }

        if (this._scale) {
            node.scaleX = this._scale[0];
            node.scaleY = this._scale[1];
        }

        if (this._anchorPoint) {
            node.setAnchorPoint(this._anchorPoint[0], this._anchorPoint[1]);
        }

        if (this._color) {
            var color = new Color(this._color[0], this._color[1], this._color[2], this._color[3]);

            // Cocos runtime 3.3 not support node.color and node opacity
            node.setColor(color);
            node.setOpacity(color.a);
        }

        return node;
    },

    /**
     * 这个方法会在场景保存前调用，你可以将 node 的属性保存到 wrapper 的可序列化的 properties 中，
     * 以便在 createNode() 方法中重新设置好 node。
     * @method onBeforeSerialize
     */
    onBeforeSerialize: function () {
        this._name  = this.name;
        this._size  = [this.size.x, this.size.y];
        this._scale = [this.scaleX, this.scaleY];
        this._rotation = this.rotation;
        this._position = [this.position.x, this.position.y];
        this._anchorPoint = [this.anchorPoint.x, this.anchorPoint.y];
        this._visible = this.visible;

        var color = this.color;
        this._color = [color.r, color.g, color.b, color.a];
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
                cc.engine.attachedWrappersForEditor[uuid] = this;
            }
        }
        this.attached();
    },

    /**
     * Invoked after the wrapper's targetN is assigned. Override this method if you need to initialize your node.
     * @method attached
     */
    attached: function () {
        if (CC_EDITOR) {
            // onEnter will be called when node enters the parent
            var originOnEnter = this.targetN.onEnter;
            this.targetN.onEnter = function () {
                originOnEnter.call(this);
                Helpers.onNodeAttachedToParent(this);
            };

            // onExit will be called when node leaves the parent
            var originOnExit = this.targetN.onExit;
            this.targetN.onExit = function () {
                originOnExit.call(this);
                Helpers.onNodeDetachedFromParent(this);
            };
        }

        this.targetN.scheduleUpdateWithPriority(this.schedulePriority);
    },

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
        return cc.getWrapper(this.parentN).childrenN.indexOf(this.targetN);
    },

    /**
     * Set the sibling index of this node.
     * (值越小越先渲染，-1 代表最后一个)
     *
     * @method setSiblingIndex
     * @param {number} index - new zero-based index of the node, -1 will move to the end of children.
     */
    setSiblingIndex: function (index) {
        if (!this.parentN) return;

        var siblings = this.parentN.children;
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

        for (var i = 0; i < siblings.length; i++) {
            siblings[i].setOrderOfArrival(i);
        }

        cc.renderer.childrenOrderDirty = true;

        var parent = this.parent;
        if (parent.onChildSiblingIndexChanged)
            parent.onChildSiblingIndexChanged();
    },

    canAddChildN: function () {
        return true;
    },

    addChildN: function (child) {
        this.targetN.addChild( child );
    },

    removeChildN: function (child, cleanup) {
        this.targetN.removeChild( child, cleanup);
    },

    setMaxOrder: function () {
        var parent = this.parentN;
        var length = parent.children.length;
        if ( length >= 2 ) {
            var prevNode = parent.children[length-2];
            var z = prevNode.getOrderOfArrival() + 1;
            this.targetN.setOrderOfArrival( z );
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
    transformPointToWorld: function (point) {
        var converted = this.targetN.convertToWorldSpaceAR(point);
        return new cc.Vec2(converted.x, converted.y);
    },

    /**
     * Transforms position from local space to world space.
     * @method transformPointToLocal
     * @param {Vec2} point
     * @return {Vec2}
     */
    transformPointToLocal: function (point) {
        var converted = this.targetN.convertToNodeSpaceAR(point);
        return new cc.Vec2(converted.x, converted.y);
    },

    // RENDERER

    /**
     * Returns a "world" axis aligned bounding box(AABB) of the renderer.
     *
     * @method getWorldBounds
     * @param {cc.Rect} [out] - optional, the receiving rect
     * @return {cc.Rect} - the rect represented in world position
     */
    getWorldBounds: function (out) {
        var size = this.size;
        var rect = cc.rect(0, 0, size.x, size.y);

        var mat = this.targetN.getNodeToWorldTransform();
        cc._rectApplyAffineTransformIn(rect, mat);

        out = out || new Rect();
        out.x = rect.x;
        out.y = rect.y;
        out.width  = rect.width;
        out.height = rect.height;

        return out;
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
        var size   = this.size;
        var width  = size.x;
        var height = size.y;

        out_bl = out_bl || new Vec2();
        out_tl = out_tl || new Vec2();
        out_tr = out_tr || new Vec2();
        out_br = out_br || new Vec2();

        var mat = this.targetN.getNodeToWorldTransform();

        // transform rect(0, 0, width, height) by matrix
        var tx = mat.tx;
        var ty = mat.ty;
        var xa = mat.a * width;
        var xb = mat.b * width;
        var yc = mat.c * height;
        var yd = mat.d * height;

        out_tl.x = tx;
        out_tl.y = ty;
        out_tr.x = xa + tx;
        out_tr.y = xb + ty;
        out_bl.x = yc + tx;
        out_bl.y = yd + ty;
        out_br.x = xa + yc + tx;
        out_br.y = xb + yd + ty;

        return [out_bl, out_tl, out_tr, out_br];
    },
});

NodeWrapper.prototype.schedulePriority = 0;

cc._setWrapperGetter(function (node) {
    if (node instanceof NodeWrapper) {
        cc.warn('cc.getWrapper() accept argument of type runtime node, not wrapper.');
        return node;
    }
    if (!node) {
        return null;
    }
    var wrapper = node._FB_wrapper;
    if (!wrapper) {
        var Wrapper = cc.getWrapperType(node);
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
