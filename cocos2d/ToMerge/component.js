// editor utils

// register id
Object.defineProperty ( Component.prototype, 'id', {
    get: function () {
        var retval = this._id;
        if (retval) {
            return retval;
        }
        //retval = Object.getOwnPropertyDescriptor(HashObject.prototype, 'id').get.call(this);
        retval = (this._id = '' + this.hashCode);
        Editor._idToObject[retval] = this;
        return retval;
    }
});

// unregister id
var doOnPreDestroy = Component.prototype._onPreDestroy;
Component.prototype._onPreDestroy = function () {
    doOnPreDestroy.call(this);
    delete Editor._idToObject[this._id];
};

/**
 * @method isLiveInEditMode
 * @param {number} entityId
 * @return {boolean}
 */
Editor.isLiveInEditMode = function (entityId) {
    var ent = Editor.getInstanceById(entityId);
    if (ent) {
        for (var i = 0; i < ent._components.length; i++) {
            var comp = ent._components[i];
            var execute = comp.constructor._executeInEditMode;
            if (execute && comp.constructor._60fpsInEditMode) {
                return true;
            }
        }
    }
    return false;
};
