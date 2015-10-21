var Path = require('path');
var Spawn = require('child_process').spawn;
var Fs = require('fire-fs');
var Chalk = require('chalk');
var Del = require('del');

var gulp = require('gulp');
var mirror = require('gulp-mirror');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var es = require('event-stream');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var handleErrors = require('../util/handleErrors');

function getUglifyOptions (minify, global_defs) {
    if (minify) {
        return {
            compress: {
                global_defs: global_defs
            }
        };
    }
    else {
        // http://lisperator.net/uglifyjs/compress
        var compress = {
            global_defs: global_defs,
            sequences: false,  // join consecutive statements with the “comma operator”
            properties: false,  // optimize property access: a["foo"] → a.foo
            //dead_code: true,  // discard unreachable code
            drop_debugger: false,  // discard “debugger” statements
            unsafe: false, // some unsafe optimizations (see below)
            conditionals: false,  // optimize if-s and conditional expressions
            comparisons: false,  // optimize comparisons
            //evaluate: true,  // evaluate constant expressions
            booleans: false,  // optimize boolean expressions
            loops: false,  // optimize loops
            unused: false,  // drop unused variables/functions
            hoist_funs: false,  // hoist function declarations
            hoist_vars: false, // hoist variable declarations
            if_return: false,  // optimize if-s followed by return/continue
            join_vars: false,  // join var declarations
            cascade: false,  // try to cascade `right` into `left` in sequences
            side_effects: false  // drop side-effect-free statements
            //warnings: true  // warn about potentially dangerous optimizations/code
        };
        // http://lisperator.net/uglifyjs/codegen
        return {
            mangle: false,
            preserveComments: 'all',
            output: {
                beautify: true,
                bracketize: true
            },
            compress: compress
        };
    }
}

function rebundle(bundler) {
    var bundle = bundler.bundle()
        .on('error', handleErrors.handler)
        .pipe(handleErrors())
        .pipe(source(paths.outFile))
        .pipe(buffer());

    var dev = sourcemaps.init({loadMaps: true})
        .pipe(uglify(getUglifyOptions(false, {
            CC_EDITOR: false,
            CC_DEV: true,
            CC_TEST: false
        })))
        .pipe(sourcemaps.write('./', {sourceRoot: './', addComment: true}))
        .pipe(gulp.dest(paths.outDir));

    var min = rename({ suffix: '-min' });
    min.pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify(getUglifyOptions(true, {
            CC_EDITOR: false,
            CC_DEV: false,
            CC_TEST: false
        })))
        .pipe(sourcemaps.write('./', {sourceRoot: './', addComment: true}))
        .pipe(gulp.dest(paths.outDir));

    return bundle.pipe(mirror(dev, min));
}

function rebundle_test(bundler, suffix) {

    var PreProcess = false;
    var TestEditorExtends = true;   // if PreProcess
    var SourceMap = false;          // if PreProcess

    var bundle = bundler.bundle()
        .on('error', handleErrors.handler)
        .pipe(handleErrors())
        .pipe(source(paths.outFile))
        .pipe(buffer())
        .pipe(rename({ suffix: suffix }));

    if (PreProcess) {
        if (SourceMap) {
            bundle = bundle.pipe(sourcemaps.init({loadMaps: true}));
        }
        bundle = bundle.pipe(uglify(getUglifyOptions(false, {
                CC_EDITOR: TestEditorExtends,
                CC_DEV: TestEditorExtends || true,
                CC_TEST: true
            })));
        if (SourceMap) {
            bundle = bundle.pipe(sourcemaps.write('./', {sourceRoot: './', addComment: true}));
        }
    }
    bundle = bundle.pipe(gulp.dest(paths.outDir));

    return bundle;
}

function createBundler(entryFiles) {
    // https://github.com/substack/node-browserify#methods
    var options = {
        debug: true,
        detectGlobals: false,    // dont insert `process`, `global`, `__filename`, and `__dirname`
        bundleExternal: false    // dont bundle external modules
        //standalone: 'engine-framework',
        //basedir: tempScriptDir
    };
    return new browserify(entryFiles, options);
}

gulp.task('compile-cocos2d', function (done) {
    console.log('Spawn ant in ' + paths.originCocos2dCompileDir);

    var spawn = require('child_process').spawn;
    var cmdStr = process.platform === 'win32' ? 'ant.bat' : 'ant';
    var child = Spawn(cmdStr, {
        cwd: paths.originCocos2dCompileDir,
        stdio: [0, 1, 'pipe']
    });
    child.on('error', function (err) {
        var ANT = Chalk.inverse('ant');
        if (err.code === 'ENOENT') {
            console.error(Chalk.red('You should install %s to build cocos2d-html5'), ANT);
        }
        else {
            console.error(Chalk.red('Failed to start %s') + ': %s', ANT, err.code);
        }
        process.exit(1);
    });
    child.stderr.on('data', function (data) {
        process.stderr.write(Chalk.red(data.toString()));
    });
    child.on('exit', function (code) {
        if (code === 0) {
            done();
        }
        else {
            process.exit(1);
        }
    });
});

gulp.task('build-modular-cocos2d', ['compile-cocos2d'], function () {
    var header = new Buffer('(function (cc, ccui, ccs, sp, cp) {');
    var footer = new Buffer(/*'\n(' + modularity + ')();\n' +*/
                            '\n}).call(window, cc, ccui, ccs, sp, cp);\n');

    function wrap (header, footer) {
        return es.through(function (file) {
            file.contents = Buffer.concat([header, file.contents, footer]);
            this.emit('data', file);
        });
    }
    gulp.src(paths.originCocos2d)
        .pipe(wrap(header, footer))
        .pipe(rename(Path.basename(paths.modularCocos2d)))
        .pipe(gulp.dest(Path.dirname(paths.modularCocos2d)));
    gulp.src(paths.originSourcemap)
        .pipe(gulp.dest(Path.dirname(paths.modularCocos2d)))
});

gulp.task('build-html5', ['build-modular-cocos2d'], function () {
    console.log('This will take some minutes...');
    return rebundle(createBundler(paths.jsEntry));
});


gulp.task('clean-test', function (done) {
    Del([paths.test.destEditorExtends, paths.test.dest], done);
});

gulp.task('build-test', ['build-modular-cocos2d', 'clean-test'], function () {
    var engine = rebundle_test(createBundler(paths.jsEntry), '-for-test');
    if (Fs.existsSync(paths.test.jsEntryEditorExtends)) {
        var editorExtends = rebundle_test(createBundler(paths.test.jsEntryEditorExtends), '-extends-for-test');
        return es.merge(engine, editorExtends);
    }
    else {
        // not in editor, skip editor extend
        return engine;
    }
});


function rebundle_jsb(bundler, minify, suffix) {
    var SourceMap = false;
    var bundle = bundler.bundle()
        .on('error', handleErrors.handler)
        .pipe(handleErrors())
        .pipe(source(paths.JSBOutFile))
        .pipe(buffer())
        .pipe(rename({ suffix: suffix }));
    if (SourceMap) {
        bundle = bundle.pipe(sourcemaps.init({loadMaps: true}));
    }
    bundle = bundle.pipe(uglify(getUglifyOptions(minify, {
        CC_EDITOR: false,
        CC_DEV: false,
        CC_TEST: false
    })));
    if (SourceMap) {
        bundle = bundle.pipe(sourcemaps.write('./', {sourceRoot: './', addComment: true}));
    }
    return bundle.pipe(gulp.dest(paths.outDir));
}

gulp.task('build-jsb-extends-min', function () {
    var jsbExtends = rebundle_jsb(createBundler(paths.JSBEntryExtends), true, '_extends');
    var jsbPredefine = rebundle_jsb(createBundler(paths.JSBEntryPredefine), true, '_predefine');
    return es.merge(jsbExtends, jsbPredefine);
});

gulp.task('build-jsb-extends-dev', function () {
    var jsbExtends = rebundle_jsb(createBundler(paths.JSBEntryExtends), false, '_extends');
    var jsbPredefine = rebundle_jsb(createBundler(paths.JSBEntryPredefine), false, '_predefine');
    return es.merge(jsbExtends, jsbPredefine);
});


gulp.task('build', ['build-html5', 'build-jsb-extends-min']);
