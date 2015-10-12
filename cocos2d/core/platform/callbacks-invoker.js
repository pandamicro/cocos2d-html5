var JS = require('./js');

/**
 * The CallbacksHandler is an abstract class that can register and unregister callbacks by key.
 * Subclasses should implement their own methods about how to invoke the callbacks.
 * @class _CallbacksHandler
 * @constructor
 * @private
 */
var CallbacksHandler = (function () {
    this._callbackTable = {};
});

/**
 * @method add
 * @param {string} key
 * @param {function} callback - can be null
 * @return {Boolean} whether the key is new
 */
CallbacksHandler.prototype.add = function (key, callback) {
    var list = this._callbackTable[key];
    if (typeof list !== 'undefined') {
        if (callback) {
            if (list !== null) {
                list.push(callback);
            }
            else {
                list = [callback];
                this._callbackTable[key] = list;
            }
        }
        return false;
    }
    else {
        // new key
        list = callback ? [callback] : null;
        this._callbackTable[key] = list;
        return true;
    }
};

/**
 * Check if the specified key has any registered callback. If a callback is also specified,
 * it will only return true if the callback is registered.
 * @method has
 * @param {string} key
 * @param {function} [callback]
 * @return {Boolean}
 */
CallbacksHandler.prototype.has = function (key, callback) {
    var list = this._callbackTable[key];
    if (list && list.length > 0) {
        if (callback) {
            return list.indexOf(callback) !== -1;
        }
        return true;
    }
    return false;
};

/**
 * @method removeAll
 * @param {string} key
 */
CallbacksHandler.prototype.removeAll = function (key) {
    delete this._callbackTable[key];
};

/**
 * @method remove
 * @param {string} key
 * @param {function} callback
 * @return {Boolean} removed
 */
CallbacksHandler.prototype.remove = function (key, callback) {
    var list = this._callbackTable[key];
    if (list) {
        var index = list.indexOf(callback);
        if (index !== -1) {
            list.splice(index, 1);
            return true;
        }
    }
    return false;
};


/**
 * The callbacks invoker to handle and invoke callbacks by key
 *
 * @class CallbacksInvoker
 * @constructor
 * @extends _CallbacksHandler
 */
var CallbacksInvoker = function () {
    CallbacksHandler.call(this);
};
JS.extend(CallbacksInvoker, CallbacksHandler);

if (CC_TEST) {
    cc._Test.CallbacksInvoker = CallbacksInvoker;
}

/**
 * @method invoke
 * @param {string} key
 * @param {any} [p1]
 * @param {any} [p2]
 * @param {any} [p3]
 * @param {any} [p4]
 * @param {any} [p5]
 */
CallbacksInvoker.prototype.invoke = function (key, p1, p2, p3, p4, p5) {
    var list = this._callbackTable[key];
    if (list) {
        for (var i = 0; i < list.length; i++) {
            list[i](p1, p2, p3, p4, p5);
        }
    }
};

/**
 * @method invokeAndRemove
 * @param {string} key
 * @param {any} [p1]
 * @param {any} [p2]
 * @param {any} [p3]
 * @param {any} [p4]
 * @param {any} [p5]
 */
CallbacksInvoker.prototype.invokeAndRemove = function (key, p1, p2, p3, p4, p5) {
    // this.invoke(key, p1, p2, p3, p4, p5);
    // 这里不直接调用invoke仅仅是为了减少调用堆栈的深度，方便调试
    var list = this._callbackTable[key];
    if (list) {
        for (var i = 0; i < list.length; i++) {
            list[i](p1, p2, p3, p4, p5);
        }
    }
    this.removeAll(key);
};

/**
 * @method bindKey
 * @param {string} key
 * @param {Boolean} [remove=false] - remove callbacks after invoked
 * @return {function} the new callback which will invoke all the callbacks binded with the same supplied key
 */
CallbacksInvoker.prototype.bindKey = function (key, remove) {
    var self = this;
    return function bindedInvocation (p1, p2, p3, p4, p5) {
        // this.invoke(key, p1, p2, p3, p4, p5);
        // 这里不直接调用invoke仅仅是为了减少调用堆栈的深度，方便调试
        var list = self._callbackTable[key];
        if (list) {
            for (var i = 0; i < list.length; i++) {
                list[i](p1, p2, p3, p4, p5);
            }
        }
        if (remove) {
            self.removeAll(key);
        }
    };
};

CallbacksInvoker.CallbacksHandler = CallbacksHandler;
module.exports = CallbacksInvoker;
