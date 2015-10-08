var sandbox = Editor.Sandbox;

/**
 * A temp fallback to contain the original behavior which can not be loaded.
 * Actually, this class will be used whenever a class failed to deserialize,
 * regardless of whether it is child class of behavior.
 */
var MissingBehavior = cc.FireClass({
    name: 'Fire.MissingBehavior',
    extends: Fire.Behavior,
    properties: {
        //_scriptUuid: {
        //    get: function () {
        //        var id = this._$erialized.__type__;
        //        if (Editor.isUuid(id)) {
        //            return Editor.decompressUuid(id);
        //        }
        //        return '';
        //    },
        //    set: function (value) {
        //        if ( !sandbox.compiled ) {
        //            cc.error('Scripts not yet compiled, please fix script errors and compile first.');
        //            return;
        //        }
        //        if (value && Editor.isUuid(value._uuid)) {
        //            var classId = Editor.compressUuid(value);
        //            if (cc.js._getClassById(classId)) {
        //                this._$erialized.__type__ = classId;
        //                Editor.sendToWindows('reload:window-scripts', sandbox.compiled);
        //            }
        //            else {
        //                cc.error('Can not find a behavior in the script which uuid is "%s".', value);
        //            }
        //        }
        //        else {
        //            cc.error('invalid script');
        //        }
        //    }
        //},
        errorInfo: {
            get: function () {
                var MSG_COMPILED = 'Can not load the associated script. Please assign a valid script.';
                var MSG_NOT_COMPILED = 'Compilation fails, please fix errors and retry.';
                return sandbox.compiled ? MSG_COMPILED : MSG_NOT_COMPILED;
            },
            multiline: true
        },
    },
    onLoad: function () {
        cc.warn('The referenced script on this Behavior is missing!');
    }
});

Editor.MissingBehavior = MissingBehavior;

module.exports = MissingBehavior;
