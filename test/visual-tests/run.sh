#!/bin/bash
echo Run unit tests in Chrome \(sh test/visual-tests/run.sh\)
echo
sh test/visual-tests/run-helper.sh &
node test/visual-tests/server.js
