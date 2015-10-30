 //The MIT License (MIT)
 //
 //Copyright (c) 2013 Gleb Bahmutov
 //
 //Permission is hereby granted, free of charge, to any person obtaining a copy of
 //this software and associated documentation files (the "Software"), to deal in
 //the Software without restriction, including without limitation the rights to
 //use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 //the Software, and to permit persons to whom the Software is furnished to do so,
 //subject to the following conditions:
 //
 //The above copyright notice and this permission notice shall be included in all
 //copies or substantial portions of the Software.
 //
 //THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 //IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 //FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 //COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 //IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 //CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/* jshint -W117:false */
(function (QUnit, env) {
  if (env.__quit_once_initialized) {
    return;
  }
  env.__quit_once_initialized = true;

  if (typeof QUnit !== 'object') {
    throw new Error('undefined QUnit object');
  }

  var _module = QUnit.module;
  if (typeof _module !== 'function') {
    throw new Error('QUnit.module should be a function');
  }

  QUnit.module = function (name, config) {
    if (typeof config !== 'object') {
      return _module.call(QUnit, name, config);
    }

    (function addSetupOnce() {
      if (QUnit.supports &&
        QUnit.supports.setupOnce) {
        return;
      }

      if (typeof config.setupOnce === 'function') {
        var _setupOnceRan = false;
        var _setup = typeof config.setup === 'function' ?
          config.setup : null;

        config.setup = function () {
          if (!_setupOnceRan) {
            config.setupOnce();
            _setupOnceRan = true;
          }

          if (_setup) {
            _setup.call(config);
          }
        };
      }
    }());

    (function addTeardownOnce() {

      if (QUnit.supports &&
        QUnit.supports.teardownOnce) {
        return;
      }

      function isLastTestInModule() {
        if (QUnit.config && Array.isArray(QUnit.config.queue)) {
          return QUnit.config.queue.length === 1;
        } else {
          // we cannot determine if the test is the last one in this module
          return false;
        }
      }

      if (typeof config.teardownOnce === 'function') {
        var _teardown = typeof config.teardown === 'function' ?
          config.teardown : null;

        config.teardown = function () {
          if (_teardown) {
            _teardown.call(config);
          }

          if (isLastTestInModule()) {
            config.teardownOnce();
            config.teardownOnceRan = true;
          }
        };

        // if multiple modules are used, the latest qunit
        // puts everything into single queue. Figure out if
        // current module is done
        QUnit.moduleDone(function (details) {
          // console.log('from', QUnit.config.currentModule);
          // console.log('module done', details);

          if (details.name === name) {
            if (!config.teardownOnceRan) {
              // console.log('running module teardown once');
              config.teardownOnce();
              config.teardownOnceRan = true;
            }
          }
        });
      }
    }());

    _module.call(QUnit, name, config);
  };
}(QUnit, typeof global === 'object' ? global : window));

