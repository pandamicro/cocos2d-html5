
var lastUpdateTime = 0;
var startTime = 0;

/**
 * !#en The interface to get time information from Fireball.
 *
 * See [Time](/en/scripting/time/)
 * !#zh Time 模块用于获得游戏里的时间和帧率相关信息。直接使用 Fire.Time.*** 访问即可。
 *
 * 请参考教程[计时和帧率](/zh/scripting/time/)
 *
 * @class Time
 * @static
 */
var Time = {

    /**
     * The time at the beginning of this frame. This is the time in seconds since the start of the game.
     * @property time
     * @type {number}
     * @readOnly
     */
    time: 0,

    /**
     * The time at the beginning of this frame. This is the real time in seconds since the start of the game.
     *
     * `Time.realTime` not affected by time scale, and also keeps increasing while the player is paused in editor or in the background.
     * @property realTime
     * @type {number}
     * @readOnly
     */
    realTime: 0,

    /**
     * The time in seconds it took to complete the last frame. Use this property to make your game frame rate independent.
     * @property deltaTime
     * @type {number}
     * @readOnly
     */
    deltaTime: 0,

    /**
     * The total number of frames that have passed.
     * @property frameCount
     * @type {number}
     * @readOnly
     */
    frameCount: 0,

    /**
     * The maximum time a frame can take.
     * @property maxDeltaTime
     * @type {number}
     * @readOnly
     */
    maxDeltaTime: 0.3333333,

    /**
     * @method _update
     * @param {number} timestamp
     * @param {Boolean} [paused=false] if true, only realTime will be updated
     * @param {number} [maxDeltaTime=Time.maxDeltaTime]
     * @private
     */
    _update: function (timestamp, paused, maxDeltaTime) {
        if (!paused) {
            maxDeltaTime = maxDeltaTime || Time.maxDeltaTime;
            var delta = timestamp - lastUpdateTime;
            delta = Math.min(maxDeltaTime, delta);
            Time.deltaTime = delta;
            lastUpdateTime = timestamp;

            if (Time.frameCount === 0) {
                startTime = timestamp;
            }
            else {
                Time.time += delta;
                Time.realTime = timestamp - startTime;
            }
            ++Time.frameCount;
        }
    },

    /**
     * @method _restart
     * @param {number} timestamp
     * @private
     */
    _restart: function (timestamp) {
        Time.time = 0;
        Time.realTime = 0;
        Time.deltaTime = 0;
        Time.frameCount = 0;
        lastUpdateTime = timestamp;
    },
};

Fire.Time = Time;

module.exports = Time;
