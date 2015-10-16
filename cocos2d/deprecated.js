if (CC_DEV) {
    var js = cc.js;

    var INFO = cc._LogInfos.deprecated;

    /**
     * Inject all of the properties in source objects to target object and return the target object.
     * @param {object} target
     * @param {object} *sources
     * @name cc.inject
     * @memberof cc
     * @deprecated
     * @returns {object}
     */
    js.get(cc, "inject", function () {
        cc.warn(INFO + " The first argument should be the destination object", 'cc.inject', 'cc.js.addon');
        return js.addon;
    });

    /**
     * Copy all of the properties in source objects to target object and return the target object.
     * @param {object} target
     * @param {object} *sources
     * @name cc.extend
     * @memberof cc
     * @deprecated
     * @returns {object}
     */
    js.get(cc, "extend", function () {
        cc.warn(INFO, 'cc.extend', 'cc.js.mixin');
        return js.mixin;
    });

    /**
     * Create new DOM element by tag name
     * @name cc.newElement
     * @memberof cc
     * @deprecated
     * @returns {object}
     */
    js.get(cc, "newElement", function () {
        cc.warn(INFO, 'cc.newElement', 'document.createElement');
        return document.createElement;
    });

    /**
     * Check the obj whether is function or not
     * @name cc.isFunction
     * @memberof cc
     * @deprecated
     * @param {*} obj
     * @returns {boolean}
     */
    js.get(cc, "isFunction", function () {
        cc.warn(INFO, 'cc.isFunction', 'cc.js.isFunction');
        return js.isFunction;
    });

    /**
     * Check the obj whether is number or not
     * @name cc.isNumber
     * @memberof cc
     * @deprecated
     * @param {*} obj
     * @returns {boolean}
     */
    js.get(cc, "isNumber", function () {
        cc.warn(INFO, 'cc.isNumber', 'cc.js.isNumber');
        return js.isNumber;
    });

    /**
     * Check the obj whether is string or not
     * @name cc.isString
     * @memberof cc
     * @deprecated
     * @param {*} obj
     * @returns {boolean}
     */
    js.get(cc, "isString", function () {
        cc.warn(INFO, 'cc.isString', 'cc.js.isString');
        return js.isString;
    });

    /**
     * Check the obj whether is array or not
     * @name cc.isArray
     * @memberof cc
     * @deprecated
     * @param {*} obj
     * @returns {boolean}
     */
    js.get(cc, "isArray", function () {
        cc.warn(INFO, 'cc.isArray', 'cc.js.isArray');
        return js.isArray;
    });

    /**
     * Check the obj whether is undefined or not
     * @name cc.isUndefined
     * @memberof cc
     * @deprecated
     * @param {*} obj
     * @returns {boolean}
     */
    js.get(cc, "isUndefined", function () {
        cc.warn(INFO, 'cc.isUndefined', 'cc.js.isUndefined');
        return js.isUndefined;
    });

    /**
     * Check the obj whether is object or not
     * @name cc.isObject
     * @memberof cc
     * @deprecated
     * @param {*} obj
     * @returns {boolean}
     */
    js.get(cc, "isObject", function () {
        cc.warn(INFO, 'cc.isObject', 'cc.js.isObject');
        return js.isObject;
    });

    /**
     * cc.Point is the class for point object, please do not use its constructor to create points, use cc.p() alias function instead.
     * @class cc.Point
     * @memberof cc
     * @deprecated
     * @param {Number} x
     * @param {Number} y
     * @see cc.Vec2
     */
    js.obsoletes(cc, 'cc', {
        "Point": 'Vec2'
    });

    /**
     * Verify Array's Type
     * @memberof cc
     * @deprecated
     * @param {Array} arr
     * @param {function} type
     * @return {Boolean}
     * @function
     */
    js.get(cc, 'arrayVerifyType', function () {
        cc.warn(INFO, 'cc.arrayVerifyType', 'cc.js.array.verifyType');
        return cc.js.array.verifyType;
    });

    /**
     * Searches for the first occurance of object and removes it. If object is not found the function has no effect.
     * @function
     * @memberof cc
     * @deprecated
     * @param {Array} arr Source Array
     * @param {*} delObj  remove object
     */
    js.get(cc, 'arrayRemoveObject', function () {
        cc.warn(INFO, 'cc.arrayRemoveObject', 'cc.js.array.remove');
        return cc.js.array.remove;
    });

    /**
     * Removes from arr all values in minusArr. For each Value in minusArr, the first matching instance in arr will be removed.
     * @function
     * @memberof cc
     * @deprecated
     * @param {Array} arr Source Array
     * @param {Array} minusArr minus Array
     */
    js.get(cc, 'arrayRemoveArray', function () {
        cc.warn(INFO, 'cc.arrayRemoveArray', 'cc.js.array.removeArray');
        return cc.js.array.removeArray;
    });

    /**
     * Inserts some objects at index
     * @function
     * @memberof cc
     * @deprecated
     * @param {Array} arr
     * @param {Array} addObjs
     * @param {Number} index
     * @return {Array}
     */
    js.get(cc, 'arrayAppendObjectsToIndex', function() {
        cc.warn(INFO, 'cc.arrayAppendObjectsToIndex', 'cc.js.array.appendObjectsAt');
        return cc.js.array.appendObjectsAt;
    });

    /**
     * Copy an array's item to a new array (its performance is better than Array.slice)
     * @memberof cc
     * @deprecated
     * @param {Array} arr
     * @return {Array}
     */
    js.get(cc, 'copyArray', function() {
        cc.warn(INFO, 'cc.copyArray', 'cc.js.array.copy');
        return cc.js.array.copy;
    });

    function deprecateEnum (obj, oldPath, newPath, hasTypePrefixBefore) {
        hasTypePrefixBefore = hasTypePrefixBefore !== false;
        var enumDef = eval(newPath);
        var entries = cc.Enum.getList(enumDef);
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i].name;
            var oldPropName;
            if (hasTypePrefixBefore) {
                var oldTypeName = oldPath.split('.').slice(-1)[0];
                oldPropName = oldTypeName + '_' + entry;
            }
            else {
                oldPropName = entry;
            }
            js.get(obj, oldPropName, function (entry) {
                cc.warn(INFO, oldPath + '_' + entry, newPath + '.' + entry);
                return enumDef[entry];
            }.bind(null, entry));
        }
    }

    deprecateEnum(cc, 'cc.TEXT_ALIGNMENT', 'cc.TextAlignment');
    deprecateEnum(cc, 'cc.VERTICAL_TEXT_ALIGNMENT', 'cc.VerticalTextAlignment');
    deprecateEnum(cc.ParticleSystem, 'cc.ParticleSystem.TYPE', 'cc.ParticleSystem.Type');
    deprecateEnum(cc.ParticleSystem, 'cc.ParticleSystem.MODE', 'cc.ParticleSystem.Mode');
    deprecateEnum(ccui.ScrollView, 'ccui.ScrollView.DIR', 'ccui.ScrollView.Dir');
    deprecateEnum(ccui.ScrollView, 'ccui.ScrollView.EVENT', 'ccui.ScrollView.Event');
    deprecateEnum(ccui.Layout, 'ccui.Layout', 'ccui.Layout.Type', false);
    deprecateEnum(ccui.LoadingBar, 'ccui.LoadingBar.TYPE', 'ccui.LoadingBar.Type');
    deprecateEnum(ccui.RelativeLayoutParameter, 'ccui.RelativeLayoutParameter', 'ccui.RelativeLayoutParameter.Type', false);
    deprecateEnum(cc.ProgressTimer, 'cc.ProgressTimer.TYPE', 'cc.ProgressTimer.Type');
    deprecateEnum(cc.game, 'cc.game.DEBUG_MODE', 'cc.DebugMode');
    deprecateEnum(cc, 'cc.KEYBOARD_RETURNTYPE', 'cc.KeyboardReturnType');
    deprecateEnum(cc, 'cc.EDITBOX_INPUT_MODE', 'cc.EditBox.InputMode');
    deprecateEnum(cc, 'cc.EDITBOX_INPUT_FLAG', 'cc.EditBox.InputFlag');
}
