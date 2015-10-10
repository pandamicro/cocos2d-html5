
Runtime.TextAlign = cc.Enum({
    /**
     * @property Left
     * @type {number}
     */
    Left: -1,
    /**
     * @property Center
     * @type {number}
     */
    Center: -1,
    /**
     * @property Right
     * @type {number}
     */
    Right: -1
});

Runtime.TextVerticalAlign = cc.Enum({
    /**
     * @property Top
     * @type {number}
     */
    Top: -1,
    /**
     * @property Center
     * @type {number}
     */
    Center: -1,
    /**
     * @property Bottom
     * @type {number}
     */
    Bottom: -1
});

Runtime.TextAnchor = cc.Enum({
    /**
     * @property TopLeft
     * @type {number}
     */
    TopLeft: -1,
    /**
     * @property TopCenter
     * @type {number}
     */
    TopCenter: -1,
    /**
     * @property TopRight
     * @type {number}
     */
    TopRight: -1,
    /**
     * @property MiddleLeft
     * @type {number}
     */
    MiddleLeft: -1,
    /**
     * @property MiddleCenter
     * @type {number}
     */
    MiddleCenter: -1,
    /**
     * @property MiddleRight
     * @type {number}
     */
    MiddleRight: -1,
    /**
     * @property BottomLeft
     * @type {number}
     */
    BottomLeft: -1,
    /**
     * @property BottomCenter
     * @type {number}
     */
    BottomCenter: -1,
    /**
     * @property BottomRight
     * @type {number}
     */
    BottomRight: -1,
});


Runtime.ParticlePositionType = cc.Enum({

    Free: cc.ParticleSystem.TYPE_FREE,

    Grouped: cc.ParticleSystem.TYPE_GROUPED
});


Runtime.ParticleEmitMode = cc.Enum({

    Gravity: cc.ParticleSystem.MODE_GRAVITY,

    Radius: cc.ParticleSystem.MODE_RADIUS
});

Runtime.ScrollDirection = cc.Enum({
    None:       ccui.ScrollView.DIR_NONE,
    Vertical:   ccui.ScrollView.DIR_VERTICAL,
    Horizontal: ccui.ScrollView.DIR_HORIZONTAL,
    Both:       ccui.ScrollView.DIR_BOTH
});

Runtime.LayoutType = cc.Enum({
    Absolute:       ccui.Layout.ABSOLUTE,
    Vertical:       ccui.Layout.LINEAR_VERTICAL,
    Horizontal:     ccui.Layout.LINEAR_HORIZONTAL,
    Relative:       ccui.Layout.RELATIVE
});

Runtime.LoadingBarDirection = cc.Enum({
    Left:       ccui.LoadingBar.TYPE_LEFT,
    Right:      ccui.LoadingBar.TYPE_RIGHT
});


Runtime.RelativeLayoutParameter = cc.Enum({
     TopLeft:           ccui.RelativeLayoutParameter.PARENT_TOP_LEFT,
     TopCenter:         ccui.RelativeLayoutParameter.PARENT_TOP_CENTER_HORIZONTAL,
     TopRight:          ccui.RelativeLayoutParameter.PARENT_TOP_RIGHT,
     LeftCenter:        ccui.RelativeLayoutParameter.PARENT_LEFT_CENTER_VERTICAL,
     Center:            ccui.RelativeLayoutParameter.CENTER_IN_PARENT,
     RightCenter:       ccui.RelativeLayoutParameter.PARENT_RIGHT_CENTER_VERTICAL,
     LeftBottom:        ccui.RelativeLayoutParameter.PARENT_LEFT_BOTTOM,
     BottomCenter:      ccui.RelativeLayoutParameter.PARENT_BOTTOM_CENTER_HORIZONTAL,
     RightBottom:       ccui.RelativeLayoutParameter.PARENT_RIGHT_BOTTOM
});

Runtime.ProgressTimerType = cc.Enum({
    Radial:     cc.ProgressTimer.TYPE_RADIAL,
    Bar:        cc.ProgressTimer.TYPE_BAR
});
