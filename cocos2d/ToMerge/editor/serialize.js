var Def = require('../core/definition');
var PersistentMask = Def.PersistentMask;
var DontSave = Def.DontSave;
var EditorOnly = Def.EditorOnly;
var _isDomNode = require('../core/utils').isDomNode;
var nicifySerialized = require('./serialize-nicify');
var CCObject = cc.Object;

var _getType = cc.js._getClassId;

var _Serializer = (function () {

    ///**
    // * @param {Boolean} [exporting=false] - if true, "editorOnly" properties will be discarded
    // */
    function _Serializer(obj, exporting) {
        this._exporting = exporting;

        this.serializedList = [];  // list of serialized data for all cc.Object objs
        this._parsingObjs = [];    // 记录当前引用对象，防止循环引用
        this._parsingData = [];    // 记录当前引用对象的序列化结果
        this._objsToResetId = [];

        _serializeMainObj(this, obj);

        for (var i = 0; i < this._objsToResetId.length; ++i) {
            this._objsToResetId[i].__id__ = undefined;
        }

        this._parsingObjs = null;
        this._parsingData = null;
        this._objsToResetId = null;
    }

    // even array may caused circular reference, so we'd be better check it all the time, 否则就要像unity限制递归层次，有好有坏
    var _checkCircularReference = function (self, obj) {
        var parsingIndex = self._parsingObjs.indexOf(obj);
        var circularReferenced = (parsingIndex !== -1);
        if (circularReferenced) {
            // register new referenced object
            var id = self.serializedList.length;
            obj.__id__ = id;        // we add this prop dynamically to simply lookup whether an obj has been serialized.
                                    // If it will lead to performance degradations in V8, we just need to save ids to another table.
            self._objsToResetId.push(obj);
            var data = self._parsingData[parsingIndex];
            if (Array.isArray(obj) === false) {
                //data.__id__ = id;   // also save id in source data, just for debugging
                var type = _getType(obj, false);
                if (type) {
                    data.__type__ = type;
                }
            }
            self.serializedList.push(data);
            return data;
        }
    };

    function enumerateByFireClass (self, obj, data, fireClass) {
        function serializeUrlField (url) {
            if (!url) {
                return undefined;
            }
            var uuid;
            if (typeof url === 'string') {
                uuid = Editor.urlToUuid(url);
            }
            else {
                uuid = url._uuid;   // 这里是为了兼容 deserialize 的 createAssetRefs 后的数据
                if (!uuid) {
                    cc.error('The url must be "string" type');
                    return undefined;
                }
            }
            if (uuid) {
                return { __uuid__: uuid };
            }
            return undefined;
        }

        var props = fireClass.__props__;

        for (var p = 0; p < props.length; p++) {
            var propName = props[p];
            var attrs = cc.FireClass.attr(fireClass, propName);

            // assume all prop in __props__ must have attr
            if (attrs.serializable === false) {
                continue;
            }
            if (self._exporting && attrs.editorOnly) {
                // skip editor only when exporting
                continue;
            }
            if (attrs.saveUrlAsAsset) {
                var url = obj[propName];
                if (Array.isArray(url)) {
                    data[propName] = url.map(serializeUrlField);
                }
                else {
                    data[propName] = serializeUrlField(url);
                }
                continue;
            }
            if (Fire.isRuntimeNode(attrs.ctor)) {
                var node = obj[propName];
                if (Array.isArray(node)) {
                    data[propName] = node.map(function (node) {
                        return _serializeField(self, cc(node));
                    });
                }
                else {
                    data[propName] = _serializeField(self, cc(node));
                }
                continue;
            }

            // undefined value (if dont save) will be stripped from JSON
            data[propName] = _serializeField(self, obj[propName]);
        }
    }

    // 将 MissingBehavior 的数据重新序列化到 target 里面
    function saveMissingBehData (self, data, originNodeData) {
        //cc.js.addon(data, obj._mixin.originNodeData);
        for (var key in originNodeData) {
            var value = originNodeData[key];
            if (Array.isArray(value)) {
                data[key] = value.map(function (x) {
                    if (x && typeof x === 'object' && Fire.getWrapperType(x)) {
                        x = cc(x);
                    }
                    return _serializeField(self, x);
                });
            }
            else {
                if (value && typeof value === 'object' && Fire.getWrapperType(value)) {
                    value = cc(value);
                }
                data[key] = _serializeField(self, value);
            }
        }
    }

    ///**
    // * @param {object} obj - The object to serialize
    // * @param {array|object} data - The array or dict where serialized data to store
    // * @return {object} The reference info used to embed to its container.
    // *                   if the serialized data not contains in serializedList, then return the data directly.
    // */
    var _enumerateObject = function (self, obj, data) {
        if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length; ++i) {
                var item = _serializeField(self, obj[i]);
                if (typeof item !== 'undefined') {     // strip undefined item (dont save)
                    data.push(item);
                }
            }
        }
        else {
            var klass = obj.constructor;
            var mixinClasses = obj._mixinClasses;
            if (mixinClasses) {
                for (var m = 0; m < mixinClasses.length; m++) {
                    var mixinClass = mixinClasses[m];
                    enumerateByFireClass(self, obj, data, mixinClass);
                }
                if (obj._mixin.originNodeData) {
                    saveMissingBehData(self, data, obj._mixin.originNodeData);
                }
            }
            else if (! cc.FireClass.isFireClass(klass)) {
                // primitive javascript object
                for (var key in obj) {
                    //cc.log(key);
                    if ( !obj.hasOwnProperty(key) || (key.charCodeAt(0) === 95 && key.charCodeAt(1) === 95))    // starts with __
                        continue;
                    // undefined value (if dont save) will be stripped from JSON
                    data[key] = _serializeField(self, obj[key]);
                }
            }
            else {
                // normal FireClass

                //if (obj.onBeforeSerialize) {
                //    obj.onBeforeSerialize();
                //}
                var props = klass.__props__;
                if (props.length > 0) {
                    if (props[props.length - 1] !== '_$erialized') {
                        enumerateByFireClass(self, obj, data, klass);
                    }
                    else {
                        // If is missing script proxy, serialized as original data
                        data.__type__ = obj._$erialized.__type__;
                        _enumerateObject(self, obj._$erialized, data);
                    }
                }
            }
        }
    };

    ///**
    // * serialize any type
    // * @param {*} val - The element to serialize
    // */
    var _serializeField = function (self, val) {
        var type = typeof val;
        if (type === 'object') {
            if (val instanceof CCObject) {
                var objFlags = val._objFlags;
                if (objFlags & DontSave) {
                    return undefined;
                }
                else if (self._exporting && (objFlags & EditorOnly)) {
                    return undefined;
                }
            }
            return _serializeObj(self, val);
        }
        else if (type !== 'function') {
            return val;
        }
        else /*function*/ {
            return null;
        }
    };

    ///**
    // * serialize only primitive object type
    // * @param {object} obj - The object to serialize
    // */
    var _serializePrimitiveObj = function (self, obj) {
        var data;
        if (Array.isArray(obj)) {
            data = [];
        }
        else {  // 'object'
            data = {};
            var type = _getType(obj, false);
            if (type) {
                data.__type__ = type;
            }
        }

        var oldSerializedCount = self.serializedList.length;

        // mark parsing to prevent circular reference
        self._parsingObjs.push(obj);
        self._parsingData.push(data);

        _enumerateObject(self, obj, data);

        self._parsingObjs.pop();
        self._parsingData.pop();

        // check whether obj has been serialized to serializedList,
        // if it is, no need to serialized to data again
        if (self.serializedList.length > oldSerializedCount) {
            var index = self.serializedList.indexOf(data, oldSerializedCount);
            if (index !== -1) {
                return { __id__: index };
            }
        }

        // inline
        return data;
    };

    ///**
    // * serialize object
    // * @param {object} obj - The object to serialize
    // */
    var _serializeObj = function (self, obj) {
        //cc.log(obj);
        if (!obj) {
            return null;
        }

        // has been serialized ?
        var id = obj.__id__;
        if (typeof id !== 'undefined') {
            return { __id__: id }; // no need to parse again
        }

        var isFObj = obj instanceof CCObject;
        if (isFObj) {
            // CCObject
            if (!obj.isValid) {
                return null;
            }
            var uuid = obj._uuid;
            if (uuid) {
                // Asset
                return {__uuid__: uuid};
            }
        }
        var ctor = obj.constructor;
        if (isFObj || cc.FireClass.isFireClass(ctor)) {
            // assign id for CCObject
            id = self.serializedList.length;
            obj.__id__ = id;        // we add this prop dynamically to simply lookup whether an obj has been serialized.
                                    // If it will lead to performance degradations in V8, we just need to save ids to another table.
            self._objsToResetId.push(obj);

            // get CCObject data
            var data = {};
            self.serializedList.push(data);

            var type = _getType(obj, false);
            if (type) {
                data.__type__ = type;
            }
            if (! obj._serialize) {
                _enumerateObject(self, obj, data);
                if (isFObj) {
                    data._objFlags &= PersistentMask;
                }
            }
            else {
                //if (isFObj) {
                //    obj._objFlags &= PersistentMask;
                //}
                data.content = obj._serialize(self._exporting);
            }

            return { __id__: id };
        }
        else if (ctor !== Object && !Array.isArray(obj) && !(_getType(obj, false) || obj._mixinClasses)) {
            // unknown obj, not serializable
            //cc.warn("" + obj + " won't be serialized");
            return null;
        }
        else {
            // primitive object, check circular reference
            // 对于原生javascript类型，只做循环引用的保护，
            // 并不保证同个对象的多处引用反序列化后仍然指向同一个对象。
            // 如果有此需求，应该继承自FObject
            var referencedData = _checkCircularReference(self, obj);
            if (referencedData) {
                // already referenced
                id = obj.__id__;
                return { __id__: id };
            }
            else {
                return _serializePrimitiveObj(self, obj);
            }
        }
    };

    ///**
    // * serialize main object
    // * 这个方法主要是对 main object 做特殊处理，虽然和 _serializeObj 很接近，但为了
    // * 避免增加 _serializeObj 的额外开销并不和它合并到一起。
    // * @param {object} obj - The object to serialize
    // */
    var _serializeMainObj = function (self, obj) {
        if (obj instanceof CCObject || cc.FireClass.isFireClass(obj.constructor)) {
            var uuid = obj._uuid;
            if (typeof uuid !== 'undefined') {
                // force Asset serializable, or _serializeObj will just return { __uuid__: ... }
                obj._uuid = null;
            }

            _serializeObj(self, obj);

            if (typeof uuid !== 'undefined') {
                // restore uuid
                obj._uuid = uuid;
            }
        }
        else if (typeof obj === 'object' && obj) {
            if (_isDomNode && _isDomNode(obj)) {
                cc.warn("" + obj + " won't be serialized");
                self.serializedList.push(null);
                return;
            }

            var data;
            if (Array.isArray(obj)) {
                data = [];
            }
            else {
                data = {};
                var type = _getType(obj, false);
                if (type) {
                    data.__type__ = type;
                }
            }

            obj.__id__ = 0;
            self._objsToResetId.push(obj);
            self.serializedList.push(data);
            _enumerateObject(self, obj, data);
        }
        else {
            self.serializedList.push(_serializeObj(self, obj));
        }
    };

    return _Serializer;
})();

/**
 * @module Editor
 */
/**
 * Serialize any object to a json string
 * @method serialize
 * @param {Asset} obj - The object to serialize
 * @param {object} [options=null]
 * @return {string|object} The json string to represent the object or json object if dontStringify is true
 */
Editor.serialize = function (obj, options) {
    var exporting = (options && options.exporting);
    // indicates whether needs to convert the result by JSON.stringify, default is true
    var stringify = (options && 'stringify' in options) ? options.stringify : true;
    var minify = (options && 'minify' in options) ? options.minify : false;
    var nicify = minify || (options && options.nicify);

    var serializer = new _Serializer(obj, exporting);
    var serializedList = serializer.serializedList;

    if (nicify) {
        nicifySerialized(serializedList);
    }

    var serializedData;
    if (serializedList.length === 1 && !Array.isArray(serializedList[0])) {
        serializedData = serializedList[0];
    }
    else {
        serializedData = serializedList;
    }
    if (stringify === false) {
        return serializedData;
    }
    else {
        return JSON.stringify(serializedData, null, minify ? 0 : 2);
    }
};

/**
 * Create a pseudo object which will be force serialized as a reference to any asset by specified uuid.
 * @method serialize.asAsset
 * @param {string} uuid
 * @return {Asset}
 */
Editor.serialize.asAsset = function (uuid) {
    if ( !uuid ) {
        cc.error('[Editor.serialize.asAsset] The uuid must be non-nil!');
    }
    var pseudoAsset = new cc.Asset();
    pseudoAsset._uuid = uuid;
    return pseudoAsset;
};

/**
 * Set the asset's name directly in JSON object
 * @method serialize.setName
 * @param {object} jsonObj
 * @param {string} name
 */
Editor.serialize.setName = function (jsonObj, name) {
    if ( Array.isArray(jsonObj) ) {
        jsonObj[0]._name = name;
    }
    else {
        jsonObj._name = name;
    }
};

module.exports = Editor.serialize;
