//var _isDomNode = require('../core/utils').isDomNode;
var JS = cc.js;
var CCObject = cc.Object;

/**
 * @module Editor
 */

function getTypeId (obj) {
    if (typeof obj === 'object') {
        obj = obj.constructor;
    }
    return JS.getClassName(obj) || JS._getClassId(obj);
}

function dumpAttrs (types, data, attrs) {
    var ctor = attrs.ctor;
    if (ctor) {
        if (Fire.isRuntimeNode(ctor)) {
            ctor = Fire.getWrapperType(ctor);
        }
        var type = getTypeId(ctor);
        data.type = type;
        if (!types[type]) {
            var isAssetType = cc.isChildClassOf(ctor, cc.RawAsset);
            var isNodeType = cc.isChildClassOf(ctor, Fire.Runtime.NodeWrapper);
            if (isAssetType || isNodeType) {
                dumpInheritanceChain(types, ctor, type);
            }
            else {
                dumpType(types, ctor, type);
            }
        }
    }
    else if (attrs.type) {
        data.type = attrs.type;
    }

    if (attrs.readonly) {
        data.readonly = attrs.readonly;
    }

    if (attrs.hasOwnProperty('default')) {
        data.default = attrs.default;
    }
    else if (attrs.hasSetter === false) {
        data.readonly = false;
    }

    if (attrs.hasOwnProperty('visible')) {
        data.visible = attrs.visible;
    }
    if (attrs.enumList) {
        // we should deep copy every js object otherwise can not using in ipc
        data.enumList = JSON.parse(JSON.stringify(attrs.enumList));
    }
    if (attrs.hasOwnProperty('displayName')) {
        data.displayName = attrs.displayName;
    }
    if (attrs.hasOwnProperty('multiline')) {
        data.multiline = attrs.multiline;
    }
    if (attrs.hasOwnProperty('min')) {
        data.min = attrs.min;
    }
    if (attrs.hasOwnProperty('max')) {
        data.max = attrs.max;
    }
    if (attrs.nullable) {
        data.nullable = attrs.nullable;
    }
    if (attrs.tooltip) {
        data.tooltip = attrs.tooltip;
    }
}

function getInheritanceChain (klass) {
    var chain = [];
    var typeId;

    // fireclass
    var superCls = klass;
    for (;;) {
        if (superCls !== klass) {
            typeId = getTypeId(superCls);
            if (typeId) {
                chain.push(typeId);
            }
        }
        if (superCls.$super) {
            superCls = superCls.$super;
        }
        else {
            break;
        }
    }
    // js class
    var dunderProto = Object.getPrototypeOf(superCls.prototype);
    while (dunderProto) {
        superCls = dunderProto.constructor;
        if (superCls && superCls !== klass) {
            typeId = getTypeId(superCls);
            if (typeId) {
                chain.push(typeId);
            }
        }
        dunderProto = Object.getPrototypeOf(superCls.prototype);
    }
    return chain;
}

// assert(obj)
function dumpType (types, objOrClass, typeId) {
    var klass;
    if (typeof objOrClass === 'object') {
        var isEnum = cc.Enum.isEnum(objOrClass);
        if (isEnum) {
            // dump Enum
            var enumList = cc.Enum.getList(objOrClass);
            return enumList;
        }
        else {
            klass = objOrClass.constructor;
        }
    }
    else {
        klass = objOrClass;
    }

    var type = {};
    types[typeId] = type;

    // dump FireClass
    if (klass) {
        // TODO - cache in klass
        var chain = getInheritanceChain(klass);
        if (chain.length > 0) {
            type.extends = chain;
        }
        // dump props
        var propNames = klass.__props__;
        if (propNames) {
            var properties = {};
            for (var p = 0; p < propNames.length; p++) {
                var propName = propNames[p];
                var dumpProp = {};
                // dump inspector attrs
                var attrs = cc.FireClass.attr(klass, propName);
                if (attrs) {
                    dumpAttrs(types, dumpProp, attrs);
                }
                properties[propName] = dumpProp;
            }
            type.properties = properties;
        }
    }
}

function dumpInheritanceChain (types, klass, typeId) {
    var type = {};
    var chain = getInheritanceChain(klass);
    if (chain.length > 0) {
        type.extends = chain;
    }
    types[typeId] = type;
}

function getExpectedTypeInClassDef (types, klass, propName) {
    var typeId = getTypeId(klass);
    if (typeId) {
        var typeInfo = types[typeId];
        if (typeInfo) {
            return typeInfo.properties[propName].type;
        }
    }
}

function dumpWrapper (types, obj, expectedType) {
    if (!obj.targetN) {
        cc.error('Missing target node of "%s"', obj._id);
        return;
    }
    var res = {
        uuid: obj.uuid,
        name: obj.name
    };
    var actualType = getTypeId(obj);
    if (expectedType !== actualType) {
        if (!types[actualType]) {
            dumpInheritanceChain(types, obj.constructor, actualType);
        }
        res.__type__ = actualType;
    }
    return res;
}

function dumpObject (types, obj, expectedType, attr) {
    if (!obj) {
        return null;
    }
    var actualType;
    var ctor = obj.constructor;
    if (obj instanceof CCObject) {
        // CCObject
        if ( !obj.isValid ) {
            return null;
        }
        var uuid = obj._uuid;
        if (uuid) {
            // Asset
            actualType = getTypeId(obj);
            if (expectedType !== actualType) {
                if (!types[actualType]) {
                    dumpInheritanceChain(types, ctor, actualType);
                }
                return {
                    __type__: actualType,
                    uuid: uuid
                };
            }
            else {
                return {
                    uuid: uuid
                };
            }
        }

        if (obj instanceof Fire.Runtime.NodeWrapper) {
            return dumpWrapper(types, obj, expectedType);
        }
    }
    else if (obj instanceof cc.ValueType) {
        var res = Editor.serialize(obj, {stringify: false});
        if (!types[res.__type__]) {
            dumpInheritanceChain(types, ctor, res.__type__);
        }
        return res;
    }

    if (cc.FireClass.isFireClass(ctor)) {
        var data = {};
        actualType = getTypeId(obj);
        if (expectedType !== actualType) {
            if (!types[actualType]) {
                dumpType(types, ctor, actualType);
            }
            data.__type__ = actualType;
        }
        // TODO - 如果嵌套怎么办？考虑在下面这次 dumpByClass 时，只支持值类型。
        dumpByClass(types, data, obj, ctor);
        return data;
    }

    if (Fire.getWrapperType(obj)) {
        var wrapper = cc(obj);
        return dumpWrapper(types, wrapper, expectedType);
    }

    return null;
}

function dumpField (types, val, klass, propName) {
    // convert url to uuid
    var attrs = cc.FireClass.attr(klass, propName);
    if (attrs.saveUrlAsAsset) {
        var type = attrs.ctor;
        if (type && typeof type === 'function' && cc.isChildClassOf(type, cc.RawAsset)) {
            if (val == null) {
                return Array.isArray(attrs.default) ? [] : {
                    uuid: ''
                };
            }
            else if (val && typeof val === 'string') {
                return {
                    uuid: Editor.urlToUuid(val) || ''
                };
            }
        }
    }
    //
    if (typeof val === 'object') {
        if (Array.isArray(val)) {
            return val.map(function (item) {
                return dumpField(types, item, klass, propName);
            });
        }
        else {
            var expectedType = getExpectedTypeInClassDef(types, klass, propName);
            var res = dumpObject(types, val, expectedType, attrs);
            // HACK, dump dummy value for inspector
            if (!res && attrs.ctor) {
                var ctor = attrs.ctor;
                if (Fire.isRuntimeNode(attrs.ctor) ||
                    cc.isChildClassOf(ctor, Fire.Runtime.NodeWrapper) ||
                    cc.isChildClassOf(ctor, cc.RawAsset)) {
                    return {
                        uuid: ''
                    };
                }
            }
            return res;
        }
    }
    else if (typeof val !== 'function') {
        return val;
    }
    else {
        // function
        return null;
    }
}

function dumpByClass (types, data, obj, klass) {
    var props = klass.__props__;
    if (props) {
        for (var p = 0; p < props.length; p++) {
            var propName = props[p];
            data[propName] = dumpField(types, obj[propName], klass, propName);
        }
    }
}

// assert(obj && typeof obj === 'object')
function dumpMain (types, wrapper) {
    var data = {};

    // dump main type
    var typeId = getTypeId(wrapper);
    if (typeId) {
        data.__type__ = typeId;
        dumpType(types, wrapper, typeId);
    }

    // dump wrapper values
    dumpByClass(types, data, wrapper, wrapper.constructor);

    if (wrapper._prefab && wrapper._prefab.asset) {
        data.__prefab__ = {
            uuid: wrapper._prefab.asset._uuid
        };
    }

    // iterate mixins
    var mixinClasses = wrapper.targetN._mixinClasses;
    if (mixinClasses) {
        data.__mixins__ = [];
        for (var i = 0; i < mixinClasses.length; i++) {
            var klass = mixinClasses[i];
            typeId = getTypeId(klass);
            if (typeId) {
                dumpType(types, klass, typeId);
                var mixinData = {
                    __type__: typeId
                };

                // dump mixin values
                dumpByClass(types, mixinData, wrapper.targetN, klass);

                data.__mixins__.push(mixinData);
            }
        }
    }

    return data;
}

/**
 * Take a snapshot on node for inspector.
 * @method getNodeDump
 * @param {RuntimeNode}
 * @return {object} - a json object
 */
Editor.getNodeDump = function (node) {
    var types = {};

    if (!node) {
        return {
            types: types,
            value: null
        };
    }

    var wrapper = cc(node);
    var value = dumpMain(types, wrapper);

    return {
        types: types,
        value: value
    };
};

module.exports = Editor.getNodeDump;

// for unit tests
Editor.getNodeDump.getInheritanceChain = getInheritanceChain;
