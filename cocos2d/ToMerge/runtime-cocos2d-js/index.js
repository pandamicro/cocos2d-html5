
if (Editor.isCoreLevel) {
    global.Runtime = {};

    require('./share/index');
    require('./core/index');
}
else {
    window.Runtime = {};

    require('./share/index');
    require('./page/index');
}

module.exports = Runtime;
