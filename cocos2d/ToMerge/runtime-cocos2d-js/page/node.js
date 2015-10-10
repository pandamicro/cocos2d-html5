var Vec2 = cc.Vec2;
var Rect = cc.FireRect;
var Color = cc.FireColor;
var Helpers = Fire.Runtime.Helpers;

/**
 * @class NodeWrapper
 * @extends Fire.Runtime.NodeWrapper
 * @constructor
 * @param {RuntimeNode} node
 */
var NodeWrapper = cc.FireClass({
    name: 'Runtime.NodeWrapper',
    extends: Fire.Runtime.NodeWrapper,

    properties: {

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

        // HIERARCHY

        /**
         * The parent of the node.
         * If this is the top most node in hierarchy, the returns value of cc(this.parent) must be type SceneWrapper.
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
                    parent = cc(value);
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
            }
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
                        return this.rotation + cc(parent).worldRotation;
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
                            this.rotation = value - cc(parent).worldRotation;
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
                return Color.fromCCColor(color);
            },
            set: function (value) {
                if (value instanceof Color) {
                    var color = value.toCCColor();
                    this.targetN.color = color;
                    this.targetN.opacity = color.a;
                }
                else {
                    cc.error('The new color must be cc.FireColor');
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

    setSiblingIndex: function (index) {
        if (!this.parentN) return;

        Fire.Runtime.NodeWrapper.prototype.setSiblingIndex.call(this, index);

        var siblings = this.parentN.children;
        for (var i=0; i<siblings.length; i++) {
            siblings[i].setOrderOfArrival(i);
        }

        cc.renderer.childrenOrderDirty = true;

        var parent = this.parent;
        if (parent.onChildSiblingIndexChanged)
            parent.onChildSiblingIndexChanged();
    },

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

    // RENDERER

    /**
     * Returns a "world" axis aligned bounding box(AABB) of the renderer.
     *
     * @method getWorldBounds
     * @param {cc.FireRect} [out] - optional, the receiving rect
     * @return {cc.FireRect} - the rect represented in world position
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

    transformPointToWorld: function (point) {
        var converted = this.targetN.convertToWorldSpaceAR(point);
        return new cc.Vec2(converted.x, converted.y);
    },

    transformPointToLocal: function (point) {
        var converted = this.targetN.convertToNodeSpaceAR(point);
        return new cc.Vec2(converted.x, converted.y);
    },

    //

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
            color = color.toCCColor();

            // Cocos runtime 3.3 not support node.color and node opacity
            node.setColor(color);
            node.setOpacity(color.a);
        }

        return node;
    },

    retain: function () {
        this.targetN.retain();
    },

    release: function () {
        this.targetN.release();
    }
});

NodeWrapper.prototype.schedulePriority = 0;

Runtime.NodeWrapper = module.exports = NodeWrapper;
