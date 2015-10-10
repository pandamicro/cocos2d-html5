var RefInfos = function () {
    // id所在的对象列表
    this.objList = [];
    // 关键字列表
    this.keyList = [];
    // 引用的id列表
    this.referncedIDList = [];
    // 引用id的次数
    this.referencedCounts = [];
    // 保存有标记_iN$t列表
    this.temporaryDataList = [];
};

var nicifySerialized = function (serialized) {

    var mainObject = serialized[0];

    if (typeof mainObject === 'undefined') {
        return;
    }

    var refInfos = new RefInfos();
    refInfos.referencedCounts = new Array(serialized.length);

    var id;
    var obj;
    var key;
    var value;
    var hasRepeatID;
    var tempSelf = serialized.slice();

    // 遍历，并且保存需要美化的数据
    _iterative(mainObject, serialized, refInfos);
    
    var idx = 0;

    // del _iN$t
    for (idx = 0; idx < refInfos.temporaryDataList.length; idx++) {
        delete refInfos.temporaryDataList[idx]._iN$t;
    }

    // dereference
    for (idx = 0; idx < refInfos.objList.length; idx++) {
        obj = refInfos.objList[idx];
        id = refInfos.referncedIDList[idx];
        key = refInfos.keyList[idx];
        value = tempSelf[id];
        hasRepeatID = refInfos.referencedCounts[id] > 1;
        if (hasRepeatID) {
            continue;
        }
        obj[key] = value;
        var delIdx = serialized.indexOf(value);
        serialized.splice(delIdx, 1);
    }

    // update id
    for (idx = 0; idx < refInfos.objList.length; idx++) {
        id = refInfos.referncedIDList[idx];
        key = refInfos.keyList[idx];
        obj = refInfos.objList[idx];
        hasRepeatID = refInfos.referencedCounts[id] > 1;
        if (hasRepeatID) {
            value = tempSelf[id];
            var newIdx = serialized.indexOf(value);
            obj[key].__id__ = newIdx;
        }
    }
};

var _iterative = function (obj, serialized, refInfos) {
    if (typeof obj !== 'object') {
        return;
    }
    obj._iN$t = true;
    refInfos.temporaryDataList.push(obj);
    if (obj.content) {
        var type = obj.__type__ && cc.js._getClassById(obj.__type__);
        if (type && type.prototype._serialize) {
            // skip customized data
            return;
        }
    }

    var element;
    if (Array.isArray(obj)) {
        for (var key = 0; key < obj.length; key++) {
            element = obj[key];
            if (element) {
                _traversalChild(element, key, obj, serialized, refInfos);
            }
        }
    }
    else {
        for (var i in obj) {
            element = obj[i];
            if (element) {
                _traversalChild(element, i, obj, serialized, refInfos);
            }
        }
    }
};

var _traversalChild = function (element, key, obj, serialized, refInfos) {
    var hasRepeatID;
    var id = element.__id__;
    var hasID = typeof id !== 'undefined';
    if (hasID) {
        element = serialized[id];
        hasRepeatID = refInfos.referncedIDList.indexOf(id) !== -1;
        if (hasRepeatID) {
            refInfos.referencedCounts[id]++;
        }
        else {
            refInfos.referencedCounts[id] = 1;
        }
        refInfos.referncedIDList.push(id);
        refInfos.keyList.push(key);
        refInfos.objList.push(obj);
    }
    var isNew = !element._iN$t;
    if (isNew) {
        _iterative(element, serialized, refInfos);
    }
    else {
        if (hasID) {
            refInfos.referencedCounts[id]++;
        }
    }
};

Fire._nicifySerialized = nicifySerialized;
module.exports = nicifySerialized;
