var JS = cc.js;

function setAsset (obj, name, uuid, type) {
    if (name.endsWith('Uuid')) {
        // TODO - obsolete me after bitmap font and particle updated
        obj[name] = uuid;
        return;
    }

    if (uuid) {
        var isUrl = !cc.isChildClassOf(type, cc.Asset);
        if (isUrl) {
            cc.AssetLibrary._queryAssetInfoInEditor(uuid, function (err, url) {
                obj[name] = url;
                Fire.engine.repaintInEditMode();
            });
        }
        else {
            cc.AssetLibrary.loadAsset(uuid, function (err, asset) {
                if (err) {
                    return Editor.error('Failed to set asset', err);
                }
                if (!(asset instanceof type)) {
                    Editor.warn('The new %s must be instance of %s', name, cc.js.getClassName(type));
                }
                obj[name] = asset;
                Fire.engine.repaintInEditMode();
            });
        }
    }
    else {
        obj[name] = null;
    }
}

// assert value.uuid && actualType
function setByUuid (attrs, obj, name, value, actualType) {
    var uuid = value.uuid;
    var type = JS.getClassByName(actualType);
    if (type) {
        if (cc.isChildClassOf(type, cc.RawAsset)) {
            setAsset(obj, name, uuid, type);
        }
        else if (cc.isChildClassOf(type, Fire.Runtime.NodeWrapper)) {
            var instance = Fire.engine.getInstanceById(uuid);
            if (instance && attrs && Fire.isRuntimeNode(attrs.ctor)) {
                obj[name] = instance.targetN;
            }
            else {
                obj[name] = instance;
            }
        }
        else {
            // just a common primitive object
            obj[name] = value;
        }
    }
    else {
        cc.warn('Unknown type to apply: ' + actualType);
    }
}

function fillDefaultValue (attr, array, start, end) {
    var Def = {
        "Boolean": false,
        "String": "",
        "Float": 0,
        "Integer": 0
    };

    var val, i;
    val = Def[attr.type];
    if (val !== undefined) {
        for (i = start; i < end; i++) {
            array[i] = val;
        }
        return;
    }

    switch (attr.type) {
        case 'Enum':
            var list = attr.enumList;
            val = (list[0] && list[0].value) || 0;
            for (i = start; i < end; i++) {
                array[i] = val;
            }
            break;
        case 'Object':
            var ctor = attr.ctor;
            if (!cc.isChildClassOf(ctor, cc.Asset) &&
                !cc.isChildClassOf(ctor, Fire.NodeWrapper) &&
                !Fire.isRuntimeNode(ctor)) {
                for (i = start; i < end; i++) {
                    array[i] = new ctor();
                }
                break;
            }
            else {
                for (i = start; i < end; i++) {
                    array[i] = null;
                }
                break;
            }
        default:
            break;
    }
}

function setPropertyByPath (node, path, value, actualType) {
    if (path.indexOf('.') === -1) {
        if (actualType && typeof value.uuid === 'string') {
            setByUuid(cc.FireClass.attr(node, path), node, path, value, actualType);
        }
        else {
            node[path] = value;
        }
    }
    else {
        // parse embedded props
        var props = path.split('.');
        var mainPropName = props[0];
        var mainProp = node[mainPropName];
        var attr = cc.FireClass.attr(node, mainPropName);
        var subProp = mainProp;

        //if (subProp) {
            for (var i = 1; i < props.length - 1; i++) {
                var subPropName = props[i];
                var subAttr = cc.FireClass.attr(subProp, subPropName);
                if (subAttr) {
                    attr = subAttr;
                }
                subProp = subProp[subPropName];
                //if (subProp == null) {
                //}
            }
            var propName = props[props.length - 1];

            if (actualType && typeof value.uuid === 'string') {
                setByUuid(attr, subProp, propName, value, actualType);
            }
            else {
                if (propName === 'length' && Array.isArray(subProp)) {
                    var oldLength = subProp.length;
                    subProp.length = value;
                    // create default array value
                    fillDefaultValue(attr, subProp, oldLength, value);
                }
                else {
                    subProp[propName] = value;
                }
                // invoke setter (for position)
                node[mainPropName] = mainProp;
            }
        //}
        //else {
        //}
    }
}

function getPropertyByPath (node, path) {
    if (path.indexOf('.') === -1) {
        return node[path];
    }
    else {
        var props = path.split('.');
        var subProp = node;
        for (var i = 0; i < props.length; i++) {
            subProp = subProp[props[i]];
            if (subProp == null) {
                cc.warn('Failed to parse "%s", %s is nil', path, props[i]);
                return null;
            }
        }
        return subProp;
    }
}

function setDeepPropertyByPath (node, path, value, actualType) {
    var isObj = typeof value === 'object' && !Array.isArray(value);
    var hasType = (value.constructor !== Object) && !(value instanceof cc.ValueType);
    var isAsset = actualType && typeof value.uuid === 'string';
    if (!(!isObj || isAsset || hasType)) {
        var obj = getPropertyByPath(node, path);
        if (obj) {
            // change current value
            for (var subKey in value) {
                var subVal = value[subKey];
                // 不会发复合对象过来，所以不用把 type 传给子对象
                setDeepPropertyByPath(obj, subKey, subVal);
            }
            // apply changes
            setPropertyByPath(node, path, obj);
            return;
        }
    }
    setPropertyByPath(node, path, value, actualType);
}

Editor.setPropertyByPath = setPropertyByPath;
Editor.setDeepPropertyByPath = setDeepPropertyByPath;
Editor.fillDefaultValue = fillDefaultValue;

module.exports = setPropertyByPath;
