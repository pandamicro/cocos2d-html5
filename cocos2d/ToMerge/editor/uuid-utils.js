var Base64KeyChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

var AsciiTo64 = new Array(128);
for (var i = 0; i < 128; ++i) { AsciiTo64[i] = 0; }
for (i = 0; i < 64; ++i) { AsciiTo64[Base64KeyChars.charCodeAt(i)] = i; }

var Reg_RemoveDash = /-/g;

// 将 uuid 的后面 27 位压缩成 18 位，前 5 位保留下来，方便调试。
// 压缩后的 uuid 可以减小保存时的尺寸，但不能做为文件名。
Editor.compressUuid = function (uuid) {
    // fc991dd7-0033-4b80-9d41-c8a86a702e59
    var striped = uuid.replace(Reg_RemoveDash, '');
    var head = striped.slice(0, 5);
    // encode base64
    var base64Chars = [];
    for (var i = 5; i < 32; i += 3) {
        var hexVal1 = parseInt(striped[i], 16);
        var hexVal2 = parseInt(striped[i + 1], 16);
        var hexVal3 = parseInt(striped[i + 2], 16);
        base64Chars.push(Base64KeyChars[(hexVal1 << 2) | (hexVal2 >> 2)]);
        base64Chars.push(Base64KeyChars[((hexVal2 & 3) << 4) | hexVal3]);
    }
    //
    return head + base64Chars.join('');
};

Editor.decompressUuid = function (str) {
    if (str.length === 23) {
        // decode base64
        var hexChars = [];
        for (var i = 5; i < 23; i += 2) {
            var lhs = AsciiTo64[str.charCodeAt(i)];
            var rhs = AsciiTo64[str.charCodeAt(i + 1)];
            hexChars.push((lhs >> 2).toString(16));
            hexChars.push((((lhs & 3) << 2) | rhs >> 4).toString(16));
            hexChars.push((rhs & 0xF).toString(16));
        }
        //
        str = str.slice(0, 5) + hexChars.join('');
    }
    return [str.slice(0, 8), str.slice(8, 12), str.slice(12, 16), str.slice(16, 20), str.slice(20)].join('-');
};

var Reg_Uuid = /^[0-9a-fA-F]{32}$/;
var Reg_CompressedUuid = /^[0-9a-zA-Z+/]{23}$/;

Editor.isUuid = function (str) {
    if (str.length === 36) {
        str = str.replace(Reg_RemoveDash, '');
    }
    return Reg_CompressedUuid.test(str) || Reg_Uuid.test(str);
};

if (CC_TEST) {
    Editor.uuid = function () {
        return '' + ((new Date()).getTime() + Math.random());
    };
}
else if (CC_EDITOR) {
    var Uuid = require('node-uuid');
    Editor.uuid = function () {
        var uuid = Uuid.v4();
        return Editor.compressUuid(uuid);
    };
}
else {
    Editor.uuid = function () {
        cc.error('Can only use uuid inside editor.');
        return '';
    };
}

module.exports = Editor;
