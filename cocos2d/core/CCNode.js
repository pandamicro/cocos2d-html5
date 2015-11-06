/****************************************************************************
 Copyright (c) 2015 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var JS = cc.js;
var Destroying = cc.Object.Flags.Destroying;
var DontDestroy = cc.Object.Flags.DontDestroy;

/**
 * @module cc
 */

/*
 * Class of all entities in Fireball scenes.
 * @class ENode
 * @extends NodeWrapper
 * @param {string} [name] - the name of the node
 * @property {Number}               x                   - x axis position of node
 * @property {Number}               y                   - y axis position of node
 * @property {Number}               width               - Width of node
 * @property {Number}               height              - Height of node
 * @property {Number}               anchorX             - Anchor point's position on x axis
 * @property {Number}               anchorY             - Anchor point's position on y axis
 * @property {Boolean}              ignoreAnchor        - Indicate whether ignore the anchor point property for positioning
 * @property {Number}               skewX               - Skew x
 * @property {Number}               skewY               - Skew y
 * @property {Number}               zIndex              - Z order in depth which stands for the drawing order
 * @property {Number}               vertexZ             - WebGL Z vertex of this node, z order works OK if all the nodes uses the same openGL Z vertex
 * @property {Number}               rotation            - Rotation of node
 * @property {Number}               rotationX           - Rotation on x axis
 * @property {Number}               rotationY           - Rotation on y axis
 * @property {Number}               scale               - Scale of node
 * @property {Number}               scaleX              - Scale on x axis
 * @property {Number}               scaleY              - Scale on y axis
 * @property {Boolean}              visible             - Indicate whether node is visible or not
 * @property {cc.Color}             color               - Color of node, default value is white: (255, 255, 255)
 * @property {Boolean}              cascadeColor        - Indicate whether node's color value affect its child nodes, default value is false
 * @property {Number}               opacity             - Opacity of node, default value is 255
 * @property {Boolean}              opacityModifyRGB    - Indicate whether opacity affect the color value, default value is false
 * @property {Boolean}              cascadeOpacity      - Indicate whether node's opacity value affect its child nodes, default value is false
 * @property {Array}                children            - <@readonly> All children nodes
 * @property {Number}               childrenCount       - <@readonly> Number of children
 * @property {cc.Node}              parent              - Parent node
 * @property {Boolean}              running             - <@readonly> Indicate whether node is running or not
 * @property {Number}               tag                 - Tag of node
 * @property {Object}               userData            - Custom user data
 * @property {Object}               userObject          - User assigned CCObject, similar to userData, but instead of holding a void* it holds an id
 * @property {Number}               arrivalOrder        - The arrival order, indicates which children is added previously
 * @property {cc.ActionManager}     actionManager       - The CCActionManager object that is used by all actions.
 * @property {cc.Scheduler}         scheduler           - cc.Scheduler used to schedule all "updates" and timers.
 * @property {cc.GLProgram}         shaderProgram       - The shader program currently used for this node
 * @property {Number}               glServerState       - The state of OpenGL server side
 */

/**
 * Class of all entities in Fireball scenes.
 * @class ENode
 * @extends NodeWrapper
 */
var Node = cc.Class({
    name: 'cc.Node',
    extends: require('./utils/node-wrapper'),

    properties: {
        /**
         * The local active state of this node.
         * @property active
         * @type {Boolean}
         * @default true
         */
        active: {
            get: function () {
                return this._active;
            },
            set: function (value) {
                value = !!value;
                if (this._active !== value) {
                    this._active = value;
                    var canActiveInHierarchy = (this._parent && this._parent._activeInHierarchy);
                    if (canActiveInHierarchy) {
                        this._onActivatedInHierarchy(value);
                    }
                }
            }
        },

        /**
         * Indicates whether this node is active in the scene.
         * @property activeInHierarchy
         * @type {Boolean}
         */
        activeInHierarchy: {
            get: function () {
                return this._activeInHierarchy;
            }
        },

        // internal properties

        _active: true,

        /**
         * @property _components
         * @type {Component[]}
         * @default []
         * @readOnly
         * @private
         */
        _components: [],

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

        /**
         * If true, the node is an persist node which won't be destroyed during scene transition.
         * If false, the node will be destroyed automatically when loading a new scene. Default is false.
         * @property _persistNode
         * @type {Boolean}
         * @default false
         * @private
         */
        _persistNode: {
            get: function () {
                return this._objFlags | DontDestroy;
            },
            set: function (value) {
                if (value) {
                    this._objFlags |= DontDestroy;
                }
                else {
                    this._objFlags &= ~DontDestroy;
                }
            }
        },

        /**
         * Register all related EventTargets, 
         * all event callbacks will be removed in _onPreDestroy
         * @property __eventTargets
         * @type array
         * @private
         */
        __eventTargets: {
            default: [],
            serializable: false
        }
    },

    ctor: function () {
        var name = arguments[0];
        this._name = typeof name !== 'undefined' ? name : 'New Node';
        this._activeInHierarchy = false;

        if (!cc.game._isCloning) {
            // create dynamically
            this._onBatchCreated();
        }
    },

    // OVERRIDES

    destroy: function () {
        if (cc.Object.prototype.destroy.call(this)) {
            // disable hierarchy
            if (this._activeInHierarchy) {
                this._deactivateChildComponents();
            }
        }
    },

    _onPreDestroy: function () {
        var parent = this._parent, i, len;
        this._objFlags |= Destroying;
        var destroyByParent = parent && (parent._objFlags & Destroying);
        if (!destroyByParent) {
            this._removeSgNode();
        }
        // Remove all listeners
        for (i = 0, len = this.__eventTargets.length; i < len; ++i) {
            var target = this.__eventTargets[i];
            target && target.targetOff && target.targetOff(this);
        }
        this.__eventTargets.length = 0;
        // destroy components
        for (i = 0, len = this._components.length; i < len; ++i) {
            var component = this._components[i];
            // destroy immediate so its _onPreDestroy can be called before
            component._destroyImmediate();
        }
        // remove from persist
        if (this._persistNode) {
            cc.game.removePersistRootNode(this);
        }
        // remove self
        if (parent) {
            if (!destroyByParent) {
                parent._children.splice(parent._children.indexOf(this), 1);
            }
        }
        // destroy children
        var children = this._children;
        for (i = 0, len = children.length; i < len; ++i) {
            // destroy immediate so its _onPreDestroy can be called before
            children[i]._destroyImmediate();
        }

        if (CC_EDITOR) {
            // detach
            delete cc.engine.attachedObjsForEditor[this._id];
        }
    },

    // COMPONENT

    /**
     * Returns the component of supplied type if the node has one attached, null if it doesn't.
     * You can also get component in the node by passing in the name of the script.
     *
     * @method getComponent
     * @param {Function|String} typeOrClassName
     * @returns {Component}
     */
    getComponent: function (typeOrClassName) {
        if ( !typeOrClassName ) {
            cc.error('getComponent: Type must be non-nil');
            return null;
        }
        var constructor;
        if (typeof typeOrClassName === 'string') {
            constructor = JS.getClassByName(typeOrClassName);
        }
        else {
            constructor = typeOrClassName;
        }
        if (constructor) {
            for (var c = 0; c < this._components.length; ++c) {
                var component = this._components[c];
                if (component instanceof constructor) {
                    return component;
                }
            }
        }
        return null;
    },

    /**
     * Adds a component class to the node. You can also add component to entity by passing in the name of the script.
     *
     * @method addComponent
     * @param {Function|String} typeOrClassName - The constructor or the class name of the component to add
     * @returns {Component} - The newly added component
     */
    addComponent: function (typeOrClassName) {
        var constructor;
        if (typeof typeOrClassName === 'string') {
            constructor = JS.getClassByName(typeOrClassName);
            if ( !constructor ) {
                cc.error('addComponent: Failed to get class "%s"', typeOrClassName);
                if (cc._RFpeek()) {
                    cc.error('addComponent: Should not add component ("%s") when the scripts are still loading.', typeOrClassName);
                }
                return null;
            }
        }
        else {
            if ( !typeOrClassName ) {
                cc.error('addComponent: Type must be non-nil');
                return null;
            }
            constructor = typeOrClassName;
        }
        if ((this._objFlags & Destroying) && CC_EDITOR) {
            cc.error('isDestroying');
            return null;
        }
        if (typeof constructor !== 'function') {
            cc.error("addComponent: The component to add must be a constructor");
            return null;
        }
        var component = new constructor();
        component.node = this;
        this._components.push(component);

        if (this._activeInHierarchy) {
            // call onLoad/onEnable
            component.__onNodeActivated(true);
        }

        return component;
    },

    /**
     * Removes a component identified by the given name or removes the component object given.
     * @method removeComponent
     * @param {String|Function|Component} component - The need remove component.
     * @deprecated please destroy the component to remove it.
     */
    removeComponent: function (component) {
        if (CC_DEV) {
            cc.warn('cc.ENode.removeComponent(component) is deprecated, please use component.destroy() instead.');
            if ( !component ) {
                cc.error('removeComponent: Component must be non-nil');
                return null;
            }
        }
        if (typeof component !== 'object') {
            component = this.getComponent(component);
        }
        if (component) {
            component.destroy();
        }
    },

    /**
     * Removes all components of cc.ENode.
     * @method removeAllComponents
     */
    removeAllComponents: function () {
        for (var i = 0; i < this._components.length; i++) {
            var comp = this._components[i];
            comp.destroy();
        }
    },

    // do remove component, only used internally
    _removeComponent: function (component) {
        if (!component) {
            cc.error('Argument must be non-nil');
            return;
        }
        if (!(this._objFlags & Destroying)) {
            var i = this._components.indexOf(component);
            if (i !== -1) {
                this._components.splice(i, 1);
                component.node = null;
            }
            else if (component.node !== this) {
                cc.error("Component not owned by this entity");
            }
        }
    },

    // INTERNAL

    _onActivatedInHierarchy: function (newActive) {
        this._activeInHierarchy = newActive;

        // component maybe added during onEnable, and the onEnable of new component is already called
        // so we should record the origin length
        var originCount = this._components.length;
        for (var c = 0; c < originCount; ++c) {
            var component = this._components[c];
            if (! (component instanceof cc.Component) && CC_EDITOR) {
                cc.error('Sorry, the component of entity "%s" which with an index of %s is corrupted! It has been removed.\nSee DevTools for details.', this.name, c);
                console.log('Corrupted component value:', component);
                this._removeComponent(component);
                --c;
                --originCount;
            }
            else {
                component.__onNodeActivated(newActive);
            }
        }
        // activate children recursively
        for (var i = 0, len = this.childrenCount; i < len; ++i) {
            var child = this._children[i];
            if (child._active) {
                child._onActivatedInHierarchy(newActive);
            }
        }
    },

    _onHierarchyChanged: function (oldParent) {
        // Not allowed for persistent node
        if (this._persistNode) {
            cc.game.removePersistRootNode(this);
        }
        var activeInHierarchyBefore = this._active && !!(oldParent && oldParent._activeInHierarchy);
        var shouldActiveNow = this._active && !!(this._parent && this._parent._activeInHierarchy);
        if (activeInHierarchyBefore !== shouldActiveNow) {
            this._onActivatedInHierarchy(shouldActiveNow);
        }
        if (CC_EDITOR) {
            var scene = cc.director.getScene();
            var inCurrentSceneBefore = oldParent && oldParent.isChildOf(scene);
            var inCurrentSceneNow = this._parent && this._parent.isChildOf(scene);
            if (!inCurrentSceneBefore && inCurrentSceneNow) {
                // attach
                cc.engine.attachedObjsForEditor[this.uuid] = this;
            }
            else if (inCurrentSceneBefore && !inCurrentSceneNow) {
                // detach
                delete cc.engine.attachedObjsForEditor[this._id];
            }
        }
    },

    _deactivateChildComponents: function () {
        // 和 _onActivatedInHierarchy 类似但不修改 this._activeInHierarchy
        var originCount = this._components.length;
        for (var c = 0; c < originCount; ++c) {
            var component = this._components[c];
            component.__onNodeActivated(false);
        }
        // deactivate children recursively
        for (var i = 0, len = this.childrenCount; i < len; ++i) {
            var entity = this._children[i];
            if (entity._active) {
                entity._deactivateChildComponents();
            }
        }
    },

    _instantiate: function () {
        var clone = cc.instantiate._clone(this, this);
        // init
        if (CC_EDITOR && cc.engine.isPlaying) {
            this._name += ' (Clone)';
        }

        clone._onBatchCreated();

        return clone;
    },

    _onBatchCreated: function () {
        var sgNode = new cc.Node();

        // retain immediately
        sgNode.retain();
        this._sgNode = sgNode;

        sgNode.setAnchorPoint(0, 1);
        if (this._parent) {
            this._parent._sgNode.addChild(sgNode);
        }

        var children = this._children;
        for (var i = 0, len = children.length; i < len; i++) {
            children[i]._onBatchCreated();
        }
    },

    _onColorChanged: function () {
        // update components if also in scene graph
        for (var c = 0; c < this._components.length; ++c) {
            var comp = this._components[c];
            if (comp instanceof cc._ComponentInSG && comp.isValid) {
                comp._sgNode.setColor(this._color);
                comp._sgNode.setOpacity(this._opacity / 255);
            }
        }
    },

    _onSizeChanged: function () {
        // update components if also in scene graph
        for (var c = 0; c < this._components.length; ++c) {
            var comp = this._components[c];
            if (comp instanceof cc._ComponentInSG && comp.isValid) {
                comp._sgNode.setContentSize(this._contentSize);
            }
        }
    },

    _onAnchorChanged: function () {
        // update components if also in scene graph
        for (var c = 0; c < this._components.length; ++c) {
            var comp = this._components[c];
            if (comp instanceof cc._ComponentInSG && comp.isValid) {
                comp._sgNode.setAnchorPoint(this._anchorPoint);
                comp._sgNode.ignoreAnchorPointForPosition(this._ignoreAnchorPointForPosition);
            }
        }
    },

    _onOpacityModifyRGBChanged: function () {
        for (var c = 0; c < this._components.length; ++c) {
            var comp = this._components[c];
            if (comp instanceof cc._ComponentInSG && comp.isValid) {
                comp._sgNode.setOpacityModifyRGB(this._opacityModifyRGB);
            }
        }
    }

});

// TODO - 这个类名是临时的，之后要改名成 cc.Node，再对外屏蔽原 cc.Node
cc.ENode = module.exports = Node;
