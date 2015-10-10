
require('./event/event-target');
require('./playable');

if (cc.sys.isBrowser) {
    // codes only available in page level
    require('./ticker');
    require('./time');
}
