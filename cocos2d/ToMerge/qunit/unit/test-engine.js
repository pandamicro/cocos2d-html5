largeModule('Engine', SetupEngine);

test('basic state transition', function() {
    strictEqual(Engine.isPlaying, false, 'init state');
    strictEqual(Engine.isPaused, false, 'init state');

    Engine.play();
    strictEqual(Engine.isPlaying, true, 'stop to play, not paused');
    strictEqual(Engine.isPaused, false, 'stop to play, not paused');

    Engine.pause();
    strictEqual(Engine.isPlaying, true, 'play to pause');
    strictEqual(Engine.isPaused, true, 'play to pause');

    Engine.play();
    strictEqual(Engine.isPlaying, true, 'pause to play');
    strictEqual(Engine.isPaused, false, 'pause to play');

    Engine.stop();
    strictEqual(Engine.isPlaying, false, 'play to stop');
    strictEqual(Engine.isPaused, false, 'play to stop');

    Engine.pause();
    strictEqual(Engine.isPlaying, false, 'paused and stop');
    strictEqual(Engine.isPaused, true, 'paused and stop');

    Engine.play();
    strictEqual(Engine.isPlaying, true, 'stop to play, paused');
    strictEqual(Engine.isPaused, true, 'stop to play, paused');
});

test('step state transition', function() {
    Engine.stop();
    strictEqual(Engine.isPlaying, false, 'reset states');
    strictEqual(Engine.isPaused, false, 'reset states');

    Engine.step();
    strictEqual(Engine.isPlaying, true, 'stop to step, not paused before');
    strictEqual(Engine.isPaused, true, 'stop to step, not paused before');

    Engine.pause();
    strictEqual(Engine.isPlaying, true, 'state should not changed if step to pause');
    strictEqual(Engine.isPaused, true, 'state should not changed if step to pause');

    Engine.play();

    Engine.step();
    strictEqual(Engine.isPlaying, true, 'play to step');
    strictEqual(Engine.isPaused, true, 'play to step');

    Engine.play();
    strictEqual(Engine.isPlaying, true, 'step to play');
    strictEqual(Engine.isPaused, false, 'step to play');

    Engine.pause();

    Engine.step();
    strictEqual(Engine.isPlaying, true, 'state should not changed if pause to step');
    strictEqual(Engine.isPaused, true, 'state should not changed if pause to step');

    Engine.step();
    strictEqual(Engine.isPlaying, true, 'state should not changed if step to step');
    strictEqual(Engine.isPaused, true, 'state should not changed if step to step');
});

asyncTest('stop -> play -> stop', function () {
    Engine.tick = function (deltaTime, updateLogic) {
        // first frame
        strictEqual(Time.time, 0, 'reset Time.time');
        strictEqual(Time.realTime, 0, 'reset Time.realTime');
        strictEqual(Time.frameCount, 1, 'reset Time.frameCount');
        strictEqual(updateLogic, true, 'update logic');

        Engine.tick = function (deltaTime, updateLogic) {
            // second frame
            ok(Time.time >= 0);     // time may not changed, not sure but perhaps it is caused by
            ok(Time.realTime >= 0); // play just triggered before browser's render tick.
            strictEqual(Time.frameCount, 2, 'second frame');
            strictEqual(updateLogic, true, 'update logic');

            Engine.tick = function (deltaTime, updateLogic) {
                // third frame
                ok(Time.time > 0, 'time should elapsed between at least 2 frame. Time.time: ' + Time.time);
                ok(Time.realTime > 0, 'time should elapsed between at least 2 frame. Time.realTime:' + Time.realTime);
                strictEqual(Time.frameCount, 3, 'third frame');
                strictEqual(updateLogic, true, 'update logic');

                Engine.tick = function () {
                    ok(false, 'should not update after stopped');
                };

                Engine.stop();

                setTimeout(function () {
                    asyncEnd();
                }, 30);
            }
        };
    };
    Engine.play();
});

asyncTest('play -> pause -> play', function () {
    Engine.tick = function (deltaTime, updateLogic) {
        // frame 1
        Engine.tick = function () {
            // frame 2
            var lastTime = Time.time;
            var lastRealTime = Time.realTime;
            var lastFrame = Time.frameCount;

            Engine.tickInEditMode = function (deltaTime, updateAnimate) {
                // frame 3
                ok(Time.realTime > lastRealTime, 'real time elpased');
                asyncEnd();
            };

            Engine.pause();
            Engine.repaintInEditMode();
        };
    };
    Engine.play();
});

asyncTest('stop -> step -> step', function () {
    Engine.tick = function (deltaTime, updateLogic) {
        // render frame 1, step frame 1
        strictEqual(updateLogic, true, 'should updateLogic in first frame');
        var lastTime = Time.time;
        var lastRealTime = Time.realTime;
        var lastFrame = Time.frameCount;
        //cc.log('Ticker.now() ' + Ticker.now());

        Engine.tickInEditMode = function (deltaTime, animating) {
            // render frame 2, step frame 1
            ok(Time.realTime >= lastRealTime);

            Engine.tick = function (deltaTime, updateLogic) {
                // render frame 3, step frame 2
                strictEqual(updateLogic, true, 'should update logic if stepping');
                ok(Time.time > lastTime, 'time elapsed');
                //cc.log('Ticker.now() ' + Ticker.now());
                ok(Time.realTime > lastRealTime, 'real time should elpased between at least 2 frame');
                strictEqual(Time.frameCount, lastFrame + 2, 'frame increased');

                asyncEnd();
            };

            Engine.step();
        };
        Engine.repaintInEditMode();
    };
    Engine.step();
});
