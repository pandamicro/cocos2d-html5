#!/bin/bash
echo Run unit tests in Chrome \(sh qunit/run.sh\)
echo \(You may need to run \"npm install gulp-qunit\" before testing.\)
echo
sh qunit/run-helper.sh &
node qunit/server.js
