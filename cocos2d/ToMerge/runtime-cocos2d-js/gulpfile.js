var gulp = require('gulp');
var requireDir = require('require-dir');

// specify game project paths for tasks.
global.paths = {
    src: './',
    outDir: './bin',
    outFile: 'runtime-cocos.js',

    get scripts() { return this.src + '/**/*.js'; },
    get jsEntry() { return this.src + '/build-entry.js'; }
};

// require all tasks in gulp/tasks, including sub-folders
requireDir('./gulp/tasks', { recurse: true });

// default task
gulp.task('default', ['jshint', 'build']);
