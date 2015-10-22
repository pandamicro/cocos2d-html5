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
var SceneGraphMaintainer = require('./utils/scene-graph-maintainer');

/**
 * Class of all entities in Fireball scenes.
 * @class
 * @name cc.ENode
 * @param {string} [name] - the name of the node
 */
var Node = cc.Class({
    name: 'cc.Node',
    extends: require('./utils/node-wrapper'),

    properties: {
        /**
         * The local active state of this node.
         * @property active
         * @type {boolean}
         * @default true
         */
        active: {
            get: function () {
                return this._active;
            },
            set: function (value) {
                if (this._active !== value) {
                    this._active = value;
                    var canActiveInHierarchy = (!this._parent || this._parent._activeInHierarchy);
                    if (canActiveInHierarchy) {
                        this._onActivatedInHierarchy(value);
                    }
                }
            }
        },

        /**
         * Indicates whether this node is active in the scene.
         * @property activeInHierarchy
         * @type {boolean}
         */
        activeInHierarchy: {
            get: function () {
                return this._activeInHierarchy;
            }
        },

        /**
         * Get the amount of children
         * @property childrenCount
         * @type {number}
         */
        childrenCount: {
            get: function () {
                return this._children.length;
            },
            visible: false
        },

        // internal properties

        _active: true,
        _parent: null,

        /**
         * @property _children
         * @type {Entity[]}
         * @default []
         * @readOnly
         * @private
         */
        _children: [],

        /**
         * @property _components
         * @type {Component[]}
         * @default []
         * @readOnly
         * @private
         */
        _components: null,
    },
    ctor: function () {
        var name = arguments[0];
        this._name = typeof name !== 'undefined' ? name : 'New Node';

        this._activeInHierarchy = !cc.game._isCloning;
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
        var parent = this._parent;
        this._objFlags |= Destroying;
        var destroyByParent = parent && (parent._objFlags & Destroying);
        if (!destroyByParent) {
            SceneGraphMaintainer.removeSgNode(this);
        }
        // destroy components
        for (var c = 0; c < this._components.length; ++c) {
            var component = this._components[c];
            // destroy immediate so its _onPreDestroy can be called before
            component._destroyImmediate();
        }
        // remove self
        if (parent) {
            if (!destroyByParent) {
                parent._children.splice(parent._children.indexOf(this), 1);
            }
        }
        // destroy children
        var children = this._children;
        for (var i = 0, len = children.length; i < len; ++i) {
            // destroy immediate so its _onPreDestroy can be called before
            children[i]._destroyImmediate();
        }
    },

    // COMPONENT

    /**
     * Returns the component of supplied type if the node has one attached, null if it doesn't.
     * You can also get component in the node by passing in the name of the script.
     *
     * @function
     * @param {function|string} typeOrClassName
     * @returns {cc.Component}
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
     * @function
     * @param {function|string} typeOrClassName - the constructor or the class name of the component to add
     * @returns {cc.Component} - the newly added component
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

    // HIERARCHY METHODS

    /**
     * Set the sibling index of this node.
     *
     * @function
     * @param {number} index
     */
    setSiblingIndex: function (index) {
        if (!this._parent) {
            return 0;
        }
        var array = this._parent._children;
        index = index !== -1 ? index : array.length - 1;
        var oldIndex = array.indexOf(this);
        if (index !== oldIndex) {
            array.splice(oldIndex, 1);
            if (index < array.length) {
                array.splice(index, 0, this);
            }
            else {
                array.push(this);
            }
            // update rendering scene graph
            SceneGraphMaintainer.onEntityIndexChanged(this);
        }
    },

    /**
     * Is this node a child of the given node?
     *
     * @function
     * @param {cc.ENode} parent
     * @return {Boolean} - Returns true if this node is a child, deep child or identical to the given node.
     */
    isChildOf: function (parent) {
        var child = this;
        do {
            if (child === parent) {
                return true;
            }
            child = child._parent;
        }
        while (child);
        return false;
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
        var activeInHierarchyBefore = this._active && (!oldParent || oldParent._activeInHierarchy);
        var shouldActiveNow = this._active && (!this._parent || this._parent._activeInHierarchy);
        if (activeInHierarchyBefore !== shouldActiveNow) {
            this._onActivatedInHierarchy(shouldActiveNow);
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

        SceneGraphMaintainer.onEntityCreated(clone);

        // activate components
        if (clone._active) {
            clone._onActivatedInHierarchy(true);
        }

        return clone;
    }
});

// TODO - 这个类名是临时的，之后要改名成 cc.Node，再对外屏蔽原 cc.Node
cc.ENode = module.exports = Node;
