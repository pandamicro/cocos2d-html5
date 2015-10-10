var Fs = !CC_TEST && require('fire-fs');
var Url = !CC_TEST && require('fire-url');
var JS = cc.js;
var Serialize = require('./serialize');

/**
 * @module Editor
 */

Editor.urlToPath = function (url) {
    return decodeURIComponent(Url.parse(url).pathname);
};

var cachedUrlToUuid = {};

function urlToUuid (url) {
    if (Editor.isPageLevel) {
        //if (!cc.AssetLibrary) {
        //    cc.error('Editor.urlToUuid is not usable in core process');
        //    return '';
        //}

        // try to parse out of url directly
        var uuid = cc.AssetLibrary.parseUuidInEditor(url);
        if (uuid) {
            return uuid;
        }
        // try to read from meta file
        var metaPath = Editor.urlToPath(url + '.meta');
        if (Fs.existsSync(metaPath)) {
            try {
                var buffer = Fs.readFileSync(metaPath);
                var meta = JSON.parse(buffer);
                uuid = meta.uuid || '';
            }
            catch (e) {
            }
        }
        //
        return uuid;
    }
    else {
        return Editor.assetdb.urlToUuid(url);
    }
}

Editor.urlToUuid = function (url) {
    var uuid = cachedUrlToUuid[url];
    if (uuid) {
        return uuid;
    }
    uuid = urlToUuid(url);
    if (uuid) {
        cachedUrlToUuid[url] = uuid;
    }
    return uuid;
};

/**
 * Wrappers should invoke this callback every time the runtime changes a serializable url internally,
 * so that the scene can be serialized correctly after AssetDB changed.
 * @method onRawAssetUsed
 * @param {string} url
 */
Editor.onRawAssetUsed = function (url, uuid) {
    if (!uuid) {
        uuid = cachedUrlToUuid[url];
        if (uuid) {
            // already cached
            return;
        }
        uuid = urlToUuid(url);
    }
    if (uuid) {
        cachedUrlToUuid[url] = uuid;
    }
};

Editor.clearUrlToUuidCache = function () {
    cachedUrlToUuid = {};
};

Editor.createNode = function (uuid, callback) {
    cc.AssetLibrary.queryAssetInfo(uuid, function (err, url, isRaw, assetType) {
        if (err) {
            return callback(err);
        }
        else if (!isRaw) {
            cc.AssetLibrary.loadAsset(uuid, function (err, asset) {
                if (err) {
                    callback(err);
                }
                else if (asset.createNode) {
                    asset.createNode(callback);
                }
                else {
                    callback(new Error('Can not create node from ' + JS.getClassName(assetType)));
                }
            });
        }
        else {
            if (assetType.createNodeByUrl) {
                assetType.createNodeByUrl(url, callback);
            }
            else {
                callback(new Error('Can not create node from ' + JS.getClassName(assetType)));
            }
        }
    });
};
