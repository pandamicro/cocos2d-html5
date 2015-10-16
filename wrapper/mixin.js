// The default mixin solution
var JS = cc.js;
var Wrapper = require('./wrappers/node');
var Behavior = require('./behavior');
var instantiateProps = require('../cocos2d/core/platform/CCClass').instantiateProps;

var LifecycleMethods = Behavior.LCMethodNames;
var lcmInvokers = Behavior.lcmInvokers;

function callInTryCatch (method, target) {
    try {
        method.call(target);
    }
    catch (e) {
        cc._throw(e);
    }
}

function mixin (node, typeOrTypename) {
    'use strict';
    if (arguments.length > 2) {
        for (var a = 1; a < arguments.length; a++) {
            mixin(node, arguments[a]);
        }
        return;
    }
    var classToMix;
    if (typeof typeOrTypename === 'string') {
        classToMix = JS.getClassByName(typeOrTypename);
        if ( !classToMix ) {
            cc.error('cc.mixin: Failed to get class "%s"');
            if (cc._RFpeek()) {
                cc.error('You should not mixin %s when the scripts are still loading.', typeOrTypename);
            }
        }
    }
    else {
        if ( !typeOrTypename ) {
            cc.error('cc.mixin: The class to mixin must be non-nil');
        }
        classToMix = typeOrTypename;
    }

    if (CC_EDITOR) {
        // validate
        if (!cc.Class._isCCClass(classToMix)) {
            cc.error('cc.mixin: The class to mixin must be CCClass.');
            return;
        }
        if (!JS._getClassId(classToMix, false) && !CC_TEST) {
            cc.error("cc.mixin: The class to mixin must have class name or script's uuid.");
            return;
        }
        if (!cc.isChildClassOf(classToMix, Behavior)) {
            cc.warn("cc.mixin: The class to mixin must inherit from cc.Behavior.");
            return;
        }
    }

    if (node instanceof Wrapper) {
        node = node.targetN;
    }

    if (!node) {
        cc.error("cc.mixin: The node to mixin must be non-nil.");
        return;
    }

    if (CC_EDITOR && node._mixinClasses && node._mixinClasses.indexOf(classToMix) !== -1) {
        cc.warn("cc.mixin: The class has already mixined.");
        return;
    }

    // init props
    instantiateProps(node, classToMix);

    // creating mixin script context
    var scriptCtx = {
        _objFlags: 0,
    };

    var mixinData;

    // maintain mixin states
    var _mixinClasses = node._mixinClasses;
    if (_mixinClasses) {
        _mixinClasses.push(classToMix);
        node._mixinContexts.push(scriptCtx);
        mixinData = node._mixin;
    }
    else {
        node._mixinClasses = [classToMix];
        node._mixinContexts = [scriptCtx];
        mixinData = {
            lcmInitStates: []
        };
        node._mixin = mixinData;
    }
    var lcmInitStates = mixinData.lcmInitStates;
    lcmInitStates.length = LifecycleMethods.length;

    // DO MIXIN
    var classToMixProto = classToMix.prototype;
    for (var propName in classToMixProto) {
        if (propName === '__cid__' ||
            propName === '__classname__' ||
            propName === 'constructor') {
            continue;
        }
        // TODO - dont mixin class attr

        var lcmIndex = LifecycleMethods.indexOf(propName);
        var isLifecycleMethods = lcmIndex !== -1;
        if (isLifecycleMethods) {
            //if (cc.game.isPaused() && CC_EDITOR) {
            //    continue;
            //}
            scriptCtx[propName] = classToMixProto[propName];
            if (! lcmInitStates[lcmIndex]) {
                lcmInitStates[lcmIndex] = true;
                // cc.warn("cc.mixin: %s's %s is overridden", cc(node).name, propName);
                (function () {
                    var invoker = lcmInvokers[propName];
                    var originMethod = node[propName];
                    if (originMethod) {
                        node[propName] = function () {
                            originMethod.apply(this, arguments);
                            invoker.apply(this, arguments);
                        };
                    }
                    else {
                        node[propName] = invoker;
                    }
                })();
            }
        }
        else {
            var pd = JS.getPropertyDescriptor(classToMixProto, propName);
            Object.defineProperty(node, propName, pd);
        }
    }

    if ((!CC_EDITOR || cc.engine._isPlaying) && !cc.game._isCloning) {
        // invoke onLoad
        var onLoad = classToMixProto.onLoad;
        if (onLoad) {
            if (CC_EDITOR) {
                callInTryCatch(onLoad, node);
            }
            else {
                onLoad.call(node);
            }
        }
    }
}

var exports = {

    mixin: mixin,

    hasMixin: function (node, typeOrTypename) {
        if (node instanceof Wrapper) {
            node = node.targetN;
        }

        if (!node) {
            return false;
        }

        var mixinClasses = node._mixinClasses;
        if (mixinClasses) {
            var classToMix;
            if (typeof typeOrTypename === 'string') {
                classToMix = JS.getClassByName(typeOrTypename);
                if ( !classToMix ) {
                    cc.error('cc.hasMixin: Failed to get class "%s"', typeOrTypename);
                    return false;
                }
            }
            else {
                if ( !typeOrTypename ) {
                    return false;
                }
                classToMix = typeOrTypename;
            }
            return mixinClasses.indexOf(classToMix) !== -1;
        }
        return false;
    },

    unMixin: function (node, typeOrTypename) {
        if ((cc.engine && cc.engine.isPlaying) || !(CC_EDITOR || CC_TEST)) {
            return cc.warn("cc.unMixin: Sorry, can not un-mixin when the engine is playing.");
        }

        if (node instanceof Wrapper) {
            node = node.targetN;
        }

        if (!node) {
            return cc.error("cc.unMixin: The node to un-mixin must be non-nil.");
        }

        var mixinClasses = node._mixinClasses;
        if (mixinClasses) {
            var classToUnmix;
            if (typeof typeOrTypename === 'string') {
                classToUnmix = JS.getClassByName(typeOrTypename);
                if ( !classToUnmix ) {
                    return cc.error('cc.unMixin: Failed to get class "%s"', typeOrTypename);
                }
            }
            else {
                if ( !typeOrTypename ) {
                    return cc.error('cc.unMixin: The class to un-mixin must be non-nil');
                }
                classToUnmix = typeOrTypename;
            }

            var index = mixinClasses.indexOf(classToUnmix);
            if (index !== -1) {
                mixinClasses.splice(index, 1);
                node._mixinContexts.splice(index, 1);
                return;
            }
        }
        return cc.error('cc.unMixin: Can not find mixed class "%s" in node "%s".',
            typeOrTypename, cc(node).name);
    }
};

module.exports = exports;
