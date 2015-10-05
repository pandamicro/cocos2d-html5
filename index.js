
// The CommonJS index file which requires the new modules comes from fireball

//require('./polyfill');

// origin codes compiled by closure
var cc = require('./bin/modular-cocos2d');

var root = typeof global !== 'undefined' ? global : window;
root.cc = cc;

require('./cocos2d/core/platform/JS');
