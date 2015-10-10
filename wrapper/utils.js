var Color = cc.FireColor;

Color.prototype.toCCColor = function () {
    return {
        r: (this.r * 255) | 0,
        g: (this.g * 255) | 0,
        b: (this.b * 255) | 0,
        a: (this.a * 255) | 0
    };
};

cc.FireColor.fromCCColor = function (color) {
    return new Color(
        color.r / 255,
        color.g / 255,
        color.b / 255,
        color.a / 255
    );
};

module.exports = {
    setFontToNode: function(fontAsset, node) {
        if (fontAsset) {
            var config = {type:'font', name: fontAsset.fontFamily, srcs:[fontAsset.url]};
            cc.loader.load(config, function (err, results) {
                if (err) throw err;

                node.fontName = config.name;
            });
        }
        else {
            node.fontName = 'Arial';
        }
    }
};
