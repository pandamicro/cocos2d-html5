var JS = cc.js;
var Animator = require('./animators').Animator;
var DynamicAnimCurve = require('./animation-curves').DynamicAnimCurve;

// The actual animator for Animation Component

function AnimationAnimator (target, animation) {
    Animator.call(this, target);
    this.animation = animation;
}
JS.extend(AnimationAnimator, Animator);
var p = AnimationAnimator.prototype;

p.playState = function (state, startTime) {
    var clip = state.clip;
    if (!clip) {
        return;
    }
    var curves = state.curves;
    if (!state.curveLoaded) {
        initClipData(this.target, state);
    }
    this.playingAnims.push(state);
    state.play();
    state.time = startTime;
    this.play();
};

p.sample = function () {
    var anims = this.playingAnims;
    for (var i = 0; i < anims.length; i++) {
        var anim = anims[i];
        anim.sample();
    }
};

p.stopState = function (state) {
    if (JS.array.remove(this.playingAnims, state)) {
        state.stop();
    }
};

if (CC_EDITOR) {
    p.reloadClip = function (state) {
        if (state.isPlaying) {
            initClipData(this.target, state);
        }
        else {
            state.curveLoaded = false;
        }
    };
}

// 这个方法应该是 SampledAnimCurve 才能用
function createBatchedProperty (propPath, firstDotIndex, mainValue, animValue) {
    mainValue = mainValue.clone();
    var nextValue = mainValue;
    var leftIndex = firstDotIndex + 1;
    var rightIndex = propPath.indexOf('.', leftIndex);

    // scan property path
    while (rightIndex !== -1) {
        var nextName = propPath.slice(leftIndex, rightIndex);
        nextValue = nextValue[nextName];
        leftIndex = rightIndex + 1;
        rightIndex = propPath.indexOf('.', leftIndex);
    }
    var lastPropName = propPath.slice(leftIndex);
    nextValue[lastPropName] = animValue;

    return mainValue;
}

if (CC_TEST) {
    cc._Test.createBatchedProperty = createBatchedProperty;
}

function splitPropPath (propPath) {
    var array = propPath.split('.');
    array.shift();
    //array = array.filter(function (item) { return !!item; });
    return array.length > 0 ? array : null;
}


function initClipData (root, state) {
    var clip = state.clip;

    var curves = state.curves;
    curves.length = 0;

    state.duration = clip.duration;
    state.speed = clip.speed;
    state.wrapMode = clip.wrapMode;

    // create curves

    function createPropCurve (target, propPath, keyframes) {
        var curve = new DynamicAnimCurve();
        // 缓存目标对象，所以 Component 必须一开始都创建好并且不能运行时动态替换……
        curve.target = target;

        var propName, propValue;
        var dotIndex = propPath.indexOf('.');
        var hasSubProp = dotIndex !== -1;
        if (hasSubProp) {
            propName = propPath.slice(0, dotIndex);
            propValue = target[propName];

            // if (!(propValue instanceof cc.ValueType)) {
            //     cc.error('Only support sub animation property which is type cc.ValueType');
            //     continue;
            // }
        }
        else {
            propName = propPath;
        }

        curve.prop = propName;

        curve.subProps = splitPropPath(propPath);

        // for each keyframes
        for (var j = 0, l = keyframes.length; j < l; j++) {
            var keyframe = keyframes[j];
            var ratio = keyframe.frame / state.duration;
            curve.ratios.push(ratio);

            var curveValue = keyframe.value;
            //if (hasSubProp) {
            //    curveValue = createBatchedProperty(propPath, dotIndex, propValue, curveValue);
            //}
            curve.values.push(curveValue);

            var curveTypes = keyframe.curve;
            if (curveTypes) {
                if (Array.isArray(curveTypes)) {
                    if (curveTypes[0] === curveTypes[1] &&
                        curveTypes[2] === curveTypes[3]) {
                        curve.types.push(DynamicAnimCurve.Linear);
                    }
                    else {
                        curve.types.push(DynamicAnimCurve.Bezier(curveTypes));
                    }
                    continue;
                }
            }
            curve.types.push(DynamicAnimCurve.Linear);
        }

        return curve;
    }

    function createTargetCurves (target, curveData) {
        var propsData = curveData.props;
        var compsData = curveData.comps;

        if (propsData) {
            for (var propPath in propsData) {
                var data = propsData[propPath];
                var curve = createPropCurve(target, propPath, data);

                curves.push(curve);
            }
        }

        if (compsData) {
            for (var compName in compsData) {
                var comp = target.getComponent(compName);
                var compData = compsData[compName];

                for (var propPath in compData) {
                    var data = compData[propPath];
                    var curve = createPropCurve(comp, propPath, data);

                    curves.push(curve);
                }
            }
        }
    }


    var curveData = clip.curveData;
    var childrenCurveDatas = curveData.paths;

    createTargetCurves(root, curveData);

    for (var namePath in childrenCurveDatas) {
        var target = cc.find(namePath, root);
        var childCurveDatas = childrenCurveDatas[namePath];

        createTargetCurves(target, childCurveDatas);
    }
}

if (CC_TEST) {
    cc._Test.initClipData = initClipData;
}


module.exports = AnimationAnimator;
