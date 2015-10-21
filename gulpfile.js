var gulp = require('gulp');
var requireDir = require('require-dir');
var Path = require('path');

// specify game project paths for tasks.
global.paths = {
    src: './src',
    jsEntry: './index.js',
    //JSBEntryPredefine: './gulp/jsb-build-entry-predefine',
    //JSBEntryExtends: './gulp/jsb-build-entry-extends',
    JSBEntryPredefine: './predefine.js',
    JSBEntryExtends: './extends.js',
    outDir: './bin',
    outFile: 'cocos2d-js.js',
    JSBOutFile: 'cocos2d-jsb.js',

    test: {
        src: 'test/qunit/unit/**/*.js',
        runner: 'test/qunit/lib/qunit-runner.html',
        jsEntryEditorExtends: '../../editor/share/engine-extends/index.js',     // only available in editor
        dest: 'bin/cocos2d-js-for-test.js',
        destEditorExtends: 'bin/cocos2d-js-extends-for-test.js'
    },

    originCocos2dCompileDir: './tools',
    originCocos2d: './lib/cocos2d-js-v3.9-min.js',
    originSourcemap: './lib/cocos2d-js-v3.9-sourcemap',
    originCocos2dDev: './lib/cocos2d-dev.js',
    modularCocos2d: './bin/modular-cocos2d.js',
};

// require all tasks in gulp/tasks, including sub-folders
requireDir('./gulp/tasks', { recurse: true });

// default task
gulp.task('default', ['build']);
