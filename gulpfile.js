var gulp = require('gulp');
var requireDir = require('require-dir');

// specify game project paths for tasks.
global.paths = {
    src: './src',
    jsEntry: './gulp/browserify-entry',
    outDir: './bin',
    outFile: 'cocos2d.js',

    test: {
        src: 'qunit/unit/**/*.js',
        runner: 'qunit/lib/qunit-runner.html',
        lib: [
            'editor/static/cc-config.js',
            'bin/cocos2d.test.js',
        ]
    },

    get scripts() { return this.src + '/**/*.js'; },

    originCocos2d: './lib/cocos2d-js-v3.9-min.js',
    modularCocos2d: './bin/modular-cocos2d.js',
};

// require all tasks in gulp/tasks, including sub-folders
requireDir('./gulp/tasks', { recurse: true });

// default task
gulp.task('default', ['build']);
