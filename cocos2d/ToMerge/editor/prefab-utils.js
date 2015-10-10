
var PrefabUtils = {};
Editor.PrefabUtils = PrefabUtils;

// Visits this node and it's children
function visitWrapper (wrapper, visitor) {
    var skipChildren = visitor(wrapper);
    if (skipChildren) {
        return;
    }
    var childrenN = wrapper.childrenN;
    for (var i = 0; i < childrenN.length; i++) {
        visitWrapper(cc(childrenN[i]), visitor);
    }
}

// Visits dumped node data
function visitNodeDumpData (data, visitor, parentWrapper) {
    visitor(data, parentWrapper);

    var children = data.c;
    if (children) {
        for (var i = 0; i < children.length; i++) {
            visitNodeDumpData(children[i], visitor, data.w);
        }
    }
}

// 遍历节点下的所有可序列化字段(不含子节点)
// 只会遍历非空的 object 类型的
function visitNodeProperties (node, visitor) {
    function parseFireClass (obj, klass) {
        klass = klass || obj.constructor;
        var props = klass.__props__;
        for (var p = 0; p < props.length; p++) {
            var key = props[p];
            var attrs = cc.FireClass.attr(klass, key);
            if (attrs.serializable === false) {
                continue;
            }
            var value = obj[key];
            if (value && typeof value === 'object') {
                if (Array.isArray(value)) {
                    for (var i = 0; i < value.length; i++) {
                        visitor(value, '' + i, value[i]);
                    }
                }
                else {
                    visitor(obj, key, value);
                }
            }
        }
    }
    var wrapper = cc(node);
    parseFireClass(wrapper);

    var mixinClasses = node._mixinClasses;
    if (mixinClasses) {
        mixinClasses.forEach(function (script) {
            parseFireClass(node, script);
        });
    }
}

PrefabUtils.createPrefabFrom = function (wrapperOrNode) {
    var wrapper;
    if (wrapperOrNode instanceof Fire.Runtime.NodeWrapper) {
        wrapper = wrapperOrNode;
    }
    else {
        wrapper = cc(wrapperOrNode);
    }

    // create PrefabInfo and save fileId
    visitWrapper(wrapper, function (w) {
        var info = w._prefab = new cc._PrefabInfo();
        info.fileId = w.uuid;
        info.rootWrapper = wrapper;
    });

    // 先拷一份出来，才不会影响到场景里的对象
    wrapper = cc.instantiate(wrapper);

    // clear wrappers id recursively and strip other node references in the scene
    visitWrapper(wrapper, function (w) {
        visitNodeProperties(w.targetN, function (obj, key, val) {
            var shouldStrip = false;
            var targetName;
            if (Fire.isRuntimeNode(val)) {
                if (!cc(val).isChildOf(wrapper)) {
                    shouldStrip = true;
                    targetName = cc(val).name;
                }
            }
            else if (val instanceof Fire.Runtime.NodeWrapper) {
                if (!val.isChildOf(wrapper)) {
                    shouldStrip = true;
                    targetName = val.name;
                }
            }
            if (shouldStrip) {
                if (!CC_TEST) {
                    cc.info('Reference "%s" of "%s" to external scene object "%s" will not be saved in prefab.', key, wrapper.name, targetName);
                }
                obj[key] = null;
            }
        });
        w._id = '';
    });

    var dumpNodeForSerialization = require('../runtime/extends/node-extends').dumpNodeForSerialization;
    var dump = dumpNodeForSerialization(wrapper.targetN);

    var prefab = new cc._Prefab();
    prefab.data = dump;

    return prefab;
};

PrefabUtils.onPrefabInstantiated = function (asset, newWrapper) {
    if (!asset._uuid) {
        cc.error('Can not get uuid from asset "%s"', asset.name);
        return;
    }
    visitWrapper(newWrapper, function (w) {
        if (!w._prefab) {
            w._prefab = new cc._PrefabInfo();
        }
        w._prefab.asset = asset;
        w._prefab.rootWrapper = newWrapper;
    });
};

PrefabUtils.savePrefabUuid = function (wrapper, prefabUuid) {
    if (!prefabUuid) {
        debugger;
    }
    var prefab = Editor.serialize.asAsset(prefabUuid);

    visitWrapper(wrapper, function (w) {
        var info = w._prefab;
        info.asset = prefab;
    });
};

/**
 * @method _revertWrapper
 * @param {Fire.Runtime.NodeWrapper} src
 * @param {Fire.Runtime.NodeWrapper} dest - wrapper type should the same with src
 */
function _revertWrapper (src, dest) {
    // reset dest node by using properties of source wrapper
    src.createNode(dest.targetN);

    // 理论上用 createNode 重设节点就行，但为了以防万一，还是把 wrapper 自身的可序列化属性也复制一遍
    var klass = src.constructor;
    var props = klass.__props__;

    var dontRevertList = ['_id', '_objFlags', '_prefab'];

    for (var p = 0; p < props.length; p++) {
        var propName = props[p];
        var attrs = cc.FireClass.attr(klass, propName);
        if (attrs.serializable === false || dontRevertList.indexOf(propName) !== -1) {
            continue;
        }
        var prop = src[propName];
        if (prop && typeof prop === 'object') {
            if (Fire.isRuntimeNode(attrs.ctor)/* || (prop._objFlags & NodeSavedAsWrapper)*/) {
                // 暂时不支持，一般也不会在 wrapper 里引用别的节点
                cc.warn('NYI');
            }
        }
        dest[propName] = prop;
    }
}

/**
 * @method _revertMixin
 * @param {Fire.Runtime.Node} target - the dest node to revert
 * @param {object} data
 */
function _revertMixin (target, data, wrapperToNode) {
    // clear-mixin list
    if (target._mixinClasses) {
        var listToRemove = target._mixinClasses.slice();
        for (var i = 0; i < listToRemove.length; i++) {
            Fire.unMixin(target, listToRemove[i]);
        }
    }
    // re-mixin
    var initMixin = Fire.Runtime.NodeWrapper._initMixin;
    Fire.engine._isCloning = true;
    initMixin(data, wrapperToNode, target);
    Fire.engine._isCloning = false;
}

PrefabUtils._doRevertPrefab = function (rootWrapperInScene, loadedPrefabAsset) {
    var data = loadedPrefabAsset.data;
    var newIdToSceneWrapper = {};
    var newIdToPrefabData = {};
    var wrapperToNode = new cc.deserialize.W2NMapper();
    var initMixin = Fire.Runtime.NodeWrapper._initMixin;

    // 添加新节点，更新所有节点的层级关系
    visitNodeDumpData(data, function (data, parentWrapperInPrefab) {
        var prefabWrapper = data.w;
        var fileId = prefabWrapper._prefab.fileId;
        newIdToPrefabData[fileId] = data;
        var sceneWrapper = findWrapperByFileId(rootWrapperInScene, fileId);
        if (!sceneWrapper) {
            // create node
            prefabWrapper.createAndAttachNode();
            Fire.engine._isCloning = true;
            initMixin(data, wrapperToNode);
            Fire.engine._isCloning = false;
            // init prefab
            var info = prefabWrapper._prefab = new cc._PrefabInfo();
            info.asset = loadedPrefabAsset;
            info.fileId = fileId;
            info.rootWrapper = rootWrapperInScene;
            //
            sceneWrapper = prefabWrapper;
        }
        newIdToSceneWrapper[fileId] = sceneWrapper;
        // update parent
        if (parentWrapperInPrefab) {
            var parentId = parentWrapperInPrefab._prefab.fileId;
            var parentWrapperInScene = newIdToSceneWrapper[parentId];
            console.assert(parentWrapperInScene, 'parent should exist');
            sceneWrapper.parent = parentWrapperInScene;
        }
    });

    // 层级关系更新后，剔除已经不存在的节点(连同子节点)，对还在的节点进行更新
    //var wrappersToRemove = [];
    visitWrapper(rootWrapperInScene, function (sceneWrapper) {
        if (sceneWrapper._prefab) {
            var fileId = sceneWrapper._prefab.fileId;
            var data = newIdToPrefabData[fileId];
            if (data) {
                var prefabWrapper = data.w;
                // update
                if (sceneWrapper.constructor === prefabWrapper.constructor) {
                    _revertWrapper(prefabWrapper, sceneWrapper);
                    _revertMixin(sceneWrapper.targetN, data, wrapperToNode);
                }
                else {
                    // 目前还不能动态修改类型，所以不会出现这样的报错
                    cc.error('Can not revert "%s", the types are different from prefab.', sceneWrapper.name);
                }
                return;
            }
        }
        // remove
        //wrappersToRemove.push(sceneWrapper);
        sceneWrapper.parentN = null;
        var skipChildren = true;
        return skipChildren;
    });
    //for (var i = 0; i < wrappersToRemove.length; i++) {
    //    var w = wrappersToRemove[i];
    //    w.parentN = null;
    //}

    // 更新 sibling index
    visitNodeDumpData(data, function (data) {
        var children = data.c;
        if (children) {
            for (var i = 0; i < children.length; i++) {
                var childData = children[i];
                var childId = childData.w._prefab.fileId;
                var sceneWrapper = newIdToSceneWrapper[childId];
                sceneWrapper.setSiblingIndex(i);
            }
        }
    });

    wrapperToNode.apply();
};

function findWrapperByFileId (wrapper, id) {
    if (wrapper._prefab && wrapper._prefab.fileId === id) {
        return wrapper;
    }

    var childrenN = wrapper.childrenN;
    for (var i = 0; i < childrenN.length; i++) {
        var wrapper = findWrapperByFileId(cc(childrenN[i]), id);
        if (wrapper) {
            return wrapper;
        }
    }

    return null;
}

// redirect wrapper or node reference (in the prefab asset data) to exists scene reference
function redirectRefToScene (obj, propName, wrapperOrNode, rootInScene) {
    var wrapperInPrefab;
    if (wrapperOrNode instanceof Fire.Runtime.NodeWrapper) {
        wrapperInPrefab = wrapperOrNode;
    }
    else {
        wrapperInPrefab = cc(wrapperOrNode);
    }
    if (!wrapperInPrefab._prefab) {
        return cc.error('Wrapper in prefab should have PrefabInfo');
    }
    // find wrapper in the scene wrapper with the same fileId
    var fileId = wrapperInPrefab._prefab.fileId;
    var wrapper = findWrapperByFileId(rootInScene, fileId);

    if (wrapper) {
        var attrs;
        if (cc.FireClass.isFireClass(obj.constructor)) {
            attrs = cc.FireClass.attr(obj, propName);
        }
        var expectNodeType = attrs && Fire.isRuntimeNode(attrs.ctor);
        if (expectNodeType) {
            obj[propName] = wrapper && wrapper.targetN;
            return;
        }
    }
    obj[propName] = wrapper;
}

PrefabUtils.revertPrefab = function (wrapper, done) {
    if (Fire.engine.isPlaying) {
        return cc.warn('Disallow to revert prefab when the engine is playing.');
    }
    if (!wrapper._prefab) {
        return;
    }

    // use visitor to redirect ref to scene
    // TODO - 如果节点被删除，要先创建出来才能还原
    var tdInfo = new cc.deserialize.Details();
    tdInfo.visitorInEditor = function (objs, propNames, deserializer) {
        var asset = deserializer.deserializedData;
        var systemObjs = new Set();
        visitNodeDumpData(asset.data, function (data) {
            systemObjs.add(data);
            if (data.c) {
                systemObjs.add(data.c);
            }
        });

        for (var i = 0; i < objs.length; ++i) {
            var obj = objs[i];
            var propName = propNames[i];
            var val = obj[propName];
            if (val && typeof val === 'object') {
                if (val instanceof Fire.Runtime.NodeWrapper || Fire.isRuntimeNode(val)) {
                    var isSystemObjs = systemObjs.has(obj);
                    if (isSystemObjs) {
                        // only redirect user's references
                        continue;
                    }
                    redirectRefToScene(obj, propName, val, wrapper);
                }
            }
        }
    };

    var uuid = wrapper._prefab.asset._uuid;
    cc.AssetLibrary.loadAsset(uuid, function (err, asset) {
        if (err) {
            return;
        }
        Editor.PrefabUtils._doRevertPrefab(wrapper, asset);
        if (done) {
            done();
        }
    }, {
        deserializeInfo: tdInfo
    });
};
