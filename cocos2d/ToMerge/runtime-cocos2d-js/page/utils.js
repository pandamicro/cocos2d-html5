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

Runtime.setFontToNode = function(fontAsset, node) {
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
};

var formatRegExp = /%[sdj%]/g;

function format (f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  if (arguments.length === 1) return f;

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
        // falls through
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (x === null || (typeof x !== 'object' && typeof x !== 'symbol')) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
}


module.exports = {
    format: format
}
