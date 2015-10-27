
var NodeWrapper = require('./node');

var shareProperties = [
    'maxParticles',
    'duration',
    'emissionRate',
    'life',
    'lifeVariance',
    'startColor',
    'startColorVariance',
    'endColor',
    'endColorVariance',
    'angle',
    'angleVariance',
    'startSize',
    'startSizeVariance',
    'endSize',
    'endSizeVariance',
    'startSpin',
    'startSpinVariance',
    'endSpin',
    'endSpinVariance',
    'sourcePosition',
    'sourcePositionVariance',
    'positionType',
    'emitterMode'
];

var gravityModeProperties = [
    'gravity',
    'speed',
    'speedVariance',
    'tangentialAccel',
    'tangentialAccelVariance',
    'radialAccel',
    'radialAccelVariance',
    'rotationIsDir'
];

var radiusModeProperties = [
    'startRadius',
    'startRadiusVariance',
    'endRadius',
    'endRadiusVariance',
    'rotatePerSecond',
    'rotatePerSecondVariance'
];

var defaultValues = {
    maxParticles: 100,
    duration: -1,
    emissionRate: 10,
    life: 1,
    lifeVariance: 0,
    startSize: 50,
    startSizeVariance: 0,
    endSize: -1,
    endSizeVariance: 0,
    angle: 90,
    angleVariance: 20,
    startColor: [1,1,1,1],
    startColorVariance: [0,0,0,0],
    endColor: [1,1,1,0],
    endColorVariance: [0,0,0,0],
    positionType: cc.ParticleSystem.Type.FREE,
    sourcePositionVariance: [0,0],
    startSpin: 0,
    startSpinVariance: 0,
    endSpin: 0,
    endSpinVariance: 0,
    emitterMode: cc.ParticleSystem.Mode.GRAVITY,

    gravity: [0,0],
    speed: 180,
    speedVariance: 50,
    radialAccel: 0,
    radialAccelVariance: 0,
    tangentialAccel: 80,
    tangentialAccelVariance: 0
};

var ParticleWrapper = cc.Class({
    name: 'cc.ParticleWrapper',
    extends: NodeWrapper,
    ctor: function () {
    },

    properties: {

        // If set custom to true, then use custom properties insteadof read particle file
        custom: {
            default: false
        },

        preview: {
            default: false,
            editorOnly: true,

            notify: function () {
                if (this.targetN) {
                    if (this.preview) {
                        this.targetN.resetSystem();
                    }
                    else {
                        this.targetN.resetSystem();
                        this.targetN.stopSystem();

                        if (CC_EDITOR) {
                            cc.engine.repaintInEditMode();
                        }
                    }
                }
            }
        },

        file: {
            get: function () {
                return this.targetN._plistFile || '';
            },
            set: function (value) {
                var target = this.targetN;

                target._plistFile = value;
                var self = this;

                cc.loader.load( value, function (err, results) {
                    if (err) throw err;

                    var originPosition = target.getPosition();
                    target.particleCount = 0;
                    target.initWithFile( value );
                    target.setPosition( originPosition );

                    if (CC_EDITOR) {
                        self.preview = self.preview;
                    }
                });
            },
            url: cc.ParticleAsset
        },

        texture: {
            get: function () {
                var tex = this.targetN.texture;
                return (tex && tex.url) || '';
            },
            set: function (value) {
                var texture = value ? cc.textureCache.addImage( value ) : null;
                this.targetN.texture = texture;
            },
            url: cc.TextureAsset
        },

        particleCount: {
            get: function () {
                return this.targetN.particleCount;
            }
        },

        maxParticles: {
            get: function () {
                return this.targetN.totalParticles;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.totalParticles = value;
                }
                else {
                    cc.error('The new duration must not be NaN');
                }
            }
        },

        duration: {
            get: function () {
                return this.targetN.duration;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.duration = value;
                }
                else {
                    cc.error('The new duration must not be NaN');
                }
            }
        },

        emissionRate: {
            get: function () {
                return this.targetN.emissionRate;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.emissionRate = value;
                }
                else {
                    cc.error('The new emissionRate must not be NaN');
                }
            }
        },

        life: {
            get: function () {
                return this.targetN.life;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.life = value;
                }
                else {
                    cc.error('The new life must not be NaN');
                }
            }
        },

        lifeVariance: {
            get: function () {
                return this.targetN.lifeVar;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.lifeVar = value;
                }
                else {
                    cc.error('The new lifeVariance must not be NaN');
                }
            }
        },

        startColor: {
            get: function () {
                return this.targetN.startColor;
            },
            set: function (value) {
                if ( value instanceof cc.Color ) {
                    this.targetN.startColor = value;
                }
                else {
                    cc.error('The new startColor must be cc.Color');
                }
            },
            type: cc.Color
        },

        startColorVariance: {
            get: function () {
                return this.targetN.startColorVar;
            },
            set: function (value) {
                if ( value instanceof cc.Color ) {
                    this.targetN.startColorVar = value;
                }
                else {
                    cc.error('The new startColorVariance must be cc.Color');
                }
            },
            type: cc.Color
        },

        endColor: {
            get: function () {
                return this.targetN.endColor;
            },
            set: function (value) {
                if ( value instanceof cc.Color ) {
                    this.targetN.endColor = value;
                }
                else {
                    cc.error('The new endColor must be cc.Color');
                }
            },
            type: cc.Color
        },

        endColorVariance: {
            get: function () {
                return this.targetN.endColorVar;
            },
            set: function (value) {
                if ( value instanceof cc.Color ) {
                    this.targetN.endColorVar = value;
                }
                else {
                    cc.error('The new endColorVariance must be cc.Color');
                }
            },
            type: cc.Color
        },


        angle: {
            get: function () {
                return this.targetN.angle;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.angle = value;
                }
                else {
                    cc.error('The new angle must not be NaN');
                }
            }
        },

        angleVariance: {
            get: function () {
                return this.targetN.angleVar;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.angleVar = value;
                }
                else {
                    cc.error('The new angleVariance must not be NaN');
                }
            }
        },

        startSize: {
            get: function () {
                return this.targetN.startSize;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.startSize = value;
                }
                else {
                    cc.error('The new startSize must not be NaN');
                }
            }
        },

        startSizeVariance: {
            get: function () {
                return this.targetN.startSizeVar;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.startSizeVar = value;
                }
                else {
                    cc.error('The new startSizeVariance must not be NaN');
                }
            }
        },

        endSize: {
            get: function () {
                return this.targetN.endSize;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.endSize = value;
                }
                else {
                    cc.error('The new endSize must not be NaN');
                }
            }
        },

        endSizeVariance: {
            get: function () {
                return this.targetN.endSizeVar;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.endSizeVar = value;
                }
                else {
                    cc.error('The new endSizeVariance must not be NaN');
                }
            }
        },

        startSpin: {
            get: function () {
                return this.targetN.startSpin || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.startSpin = value;
                }
                else {
                    cc.error('The new startSpin must not be NaN');
                }
            }
        },

        startSpinVariance: {
            get: function () {
                return this.targetN.startSpinVar || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.startSpinVar = value;
                }
                else {
                    cc.error('The new startSpinVariance must not be NaN');
                }
            }
        },

        endSpin: {
            get: function () {
                return this.targetN.endSpin || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.endSpin = value;
                }
                else {
                    cc.error('The new endSpin must not be NaN');
                }
            }
        },

        endSpinVariance: {
            get: function () {
                return this.targetN.endSpinVar || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.endSpinVar = value;
                }
                else {
                    cc.error('The new endSpinVariance must not be NaN');
                }
            }
        },

        sourcePosition: {
            get: function () {
                var pos = this.targetN.sourcePos;
                return new cc.Vec2(pos.x, pos.y);
            },
            set: function (value) {
                if ( value instanceof cc.Vec2 ) {
                    this.targetN.sourcePos = cc.p(value.x, value.y);
                }
                else {
                    cc.error('The new sourcePosition must be cc.Vec2');
                }
            },
            type: cc.Vec2
        },

        sourcePositionVariance: {
            get: function () {
                var pos = this.targetN.posVar;
                return new cc.Vec2(pos.x, pos.y);
            },
            set: function (value) {
                if ( value instanceof cc.Vec2 ) {
                    this.targetN.posVar = cc.p(value.x, value.y);
                }
                else {
                    cc.error('The new sourcePositionVariance must be cc.Vec2');
                }
            },
            type: cc.Vec2
        },

        // cc.ParticleSystem.Type.FREE | cc.ParticleSystem.Type.GROUPED
        positionType: {
            get: function () {
                return this.targetN.positionType;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.positionType = value;
                }
                else {
                    cc.error('The new positionType must not be NaN');
                }
            },
            type: cc.ParticleSystem.Type
        },

        // cc.ParticleSystem.Mode.GRAVITY: uses gravity, speed, radial and tangential acceleration;
        // cc.ParticleSystem.Mode.RADIUS : uses radius movement + rotation.
        emitterMode: {
            get: function () {
                return this.targetN.emitterMode;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.emitterMode = value;
                }
                else {
                    cc.error('The new emitterMode must not be NaN');
                }
            },
            type: cc.ParticleSystem.Mode
        },


        // cc.ParticleSystem.Mode.GRAVITY

        gravity: {
            get: function () {
                var gravity = this.targetN.gravity;
                return new cc.Vec2(gravity.x, gravity.y);
            },
            set: function (value) {
                if ( value instanceof cc.Vec2) {
                    this.targetN.gravity = cc.p(value.x, value.y);
                }
                else {
                    cc.error('The new gravity must be cc.Vec2');
                }
            },
            type: cc.Vec2
        },

        speed: {
            get: function () {
                return this.targetN.speed || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.speed = value;
                }
                else {
                    cc.error('The new speed must not be NaN');
                }
            }
        },

        speedVariance: {
            get: function () {
                return this.targetN.speedVar || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.speedVar = value;
                }
                else {
                    cc.error('The new speedVariance must not be NaN');
                }
            }
        },

        tangentialAccel: {
            get: function () {
                return this.targetN.tangentialAccel || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.tangentialAccel = value;
                }
                else {
                    cc.error('The new tangentialAccel must not be NaN');
                }
            }
        },

        tangentialAccelVariance: {
            get: function () {
                return this.targetN.tangentialAccelVar || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.tangentialAccelVar = value;
                }
                else {
                    cc.error('The new tangentialAccelVariance must not be NaN');
                }
            }
        },

        radialAccel: {
            get: function () {
                return this.targetN.radialAccel || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.radialAccel = value;
                }
                else {
                    cc.error('The new radialAccel must not be NaN');
                }
            }
        },

        radialAccelVariance: {
            get: function () {
                return this.targetN.radialAccelVar || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.radialAccelVar = value;
                }
                else {
                    cc.error('The new radialAccelVariance must not be NaN');
                }
            }
        },

        rotationIsDir: {
            get: function () {
                return this.targetN.rotationIsDir;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.rotationIsDir = value;
                }
                else {
                    cc.error('The new rotationIsDir must not be NaN');
                }
            }
        },


        // cc.ParticleSystem.Mode.RADIUS

        startRadius: {
            get: function () {
                return this.targetN.startRadius || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.startRadius = value;
                }
                else {
                    cc.error('The new startRadius must not be NaN');
                }
            }
        },

        startRadiusVariance: {
            get: function () {
                return this.targetN.startRadiusVar || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.startRadiusVar = value;
                }
                else {
                    cc.error('The new startRadiusVariance must not be NaN');
                }
            }
        },

        endRadius: {
            get: function () {
                return this.targetN.endRadius || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.endRadius = value;
                }
                else {
                    cc.error('The new endRadius must not be NaN');
                }
            }
        },

        endRadiusVariance: {
            get: function () {
                return this.targetN.endRadiusVar || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.endRadiusVar = value;
                }
                else {
                    cc.error('The new endRadiusVariance must not be NaN');
                }
            }
        },

        rotatePerSecond: {
            get: function () {
                return this.targetN.rotatePerSecond || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.rotatePerSecond = value;
                }
                else {
                    cc.error('The new rotatePerSecond must not be NaN');
                }
            }
        },

        rotatePerSecondVariance: {
            get: function () {
                return this.targetN.rotatePerSecondVar || 0;
            },
            set: function (value) {
                if ( !isNaN(value)) {
                    this.targetN.rotatePerSecondVar = value;
                }
                else {
                    cc.error('The new rotatePerSecondVariance must not be NaN');
                }
            }
        },

        _file: {
            default: '',
            url: cc.ParticleAsset
        },

        _texture: {
            default: '',
            url: cc.TextureAsset
        },

        _serializeObject: {
            default: null
        }
    },

    statics: {
        _60fpsInEditMode: true
    },

    onFocusInEditor: function () {
        if (!this.preview) return;

        this.targetN.resetSystem();
    },

    onLostFocusInEditor: function () {
        if (!this.preview) return;

        this.targetN.resetSystem();
        this.targetN.stopSystem();

        if (CC_EDITOR) {
            cc.engine.repaintInEditMode();
        }
    },

    _serializeToObject: function (object, property) {
        var value = this[property];

        if (value instanceof cc.Color) {
            object[property] = [value.r, value.g, value.b, value.a];
        }
        else if (value instanceof cc.Vec2) {
            object[property] = [value.x, value.y];
        }
        else {
            object[property] = value;
        }
    },

    _deserializeFromObject: function (object, property) {
        if (property === 'rotationIsDir') {
            var a = 1;
        }
        var value = object[property];

        if (!value) return;

        var attr = cc.Class.attr(ParticleWrapper, property);

        if (attr.ctor === cc.Color) {
            this[property] = value ? new cc.Color(value[0], value[1], value[2], value[3]) : cc.Color.WHITE;;
        }
        else if(attr.ctor === cc.Vec2) {
            this[property] = value ? new cc.Vec2(value[0], value[1]) : cc.Vec2.zero;
        }
        else {
            this[property] = value;
        }
    },

    _createTextureFromData: function (imgPath, textureData) {
        if (!textureData) return null;

        var texture = cc.textureCache.getTextureForKey(imgPath);
        if (texture) return texture;

        var buffer = cc.unzipBase64AsArray(textureData, 1);
        if (!buffer) {
            cc.error("Error decoding or ungzipping textureImageData");
            return false;
        }

        var imageFormat = cc.getImageFormatByData(buffer);

        if(imageFormat !== cc.FMT_TIFF && imageFormat !== cc.FMT_PNG){
            cc.error("Unknown image format with Data");
            return false;
        }

        var canvasObj = document.createElement("canvas");
        if(imageFormat === cc.FMT_PNG){
            var myPngObj = new cc.PNGReader(buffer);
            myPngObj.render(canvasObj);
        } else {
            var myTIFFObj = cc.tiffReader;
            myTIFFObj.parseTIFF(buffer,canvasObj);
        }

        cc.textureCache.cacheImage(imgPath, canvasObj);

        texture = cc.textureCache.getTextureForKey(imgPath);
        if(!texture)
            cc.error("Error loading the texture");

        return texture;
    },

    onBeforeSerialize: function () {
        NodeWrapper.prototype.onBeforeSerialize.call(this);

        this._file = this.file;

        if (this.custom) {
            this._serializeObject = {};
            var object = this._serializeObject;

            object.emitterMode = this.emitterMode;

            var modeProperties = object.emitterMode === cc.ParticleSystem.Mode.GRAVITY ? gravityModeProperties : radiusModeProperties;
            var properties = shareProperties.concat(modeProperties);

            properties.forEach(function (property) {
                this._serializeToObject(object, property);
            }.bind(this));

            this._texture = this.texture;
        }
        else {
            this._serializeObject = null;
        }
    },

    createNode: function (node) {
        node = node || new cc.ParticleSystem();

        NodeWrapper.prototype.createNode.call(this, node);

        var object = this._serializeObject;
        if (this.custom && object) {

            var modeProperties = object.emitterMode === cc.ParticleSystem.Mode.GRAVITY ? gravityModeProperties : radiusModeProperties;
            var properties = shareProperties.concat(modeProperties);

            var oldTarget = this.targetN;
            this.targetN = node;

            properties.forEach(function (property) {
                this._deserializeFromObject(object, property);
            }.bind(this));

            this.targetN = oldTarget;

            if ( this._texture ) {
                var texture = cc.textureCache.addImage( this._texture );
                node.texture = texture;
            }
            else if( this._file ) {
                node._plistFile = this._file;

                var dictionary = cc.loader.getRes(this._file);

                if (dictionary) {
                    var textureName = dictionary['textureFileName'];
                    var texture = cc.textureCache.getTextureForKey(textureName);

                    if (!texture) {
                        var textureData = dictionary['textureImageData'];

                        texture = this._createTextureFromData(textureName, textureData);
                    }

                    node.texture = texture;
                }
            }
        }
        else {
            if ( this._file ) {
                var originPosition = node.getPosition();
                node.initWithFile( this._file );
                node.setPosition( originPosition );
            }
            else {
                this.custom = true;

                var properties = shareProperties.concat(gravityModeProperties);

                var oldTarget = this.targetN;
                this.targetN = node;

                properties.forEach(function (property) {
                    this._deserializeFromObject(defaultValues, property);
                }.bind(this));

                var oldTarget = this.targetN;
                this.targetN = node;

                this.targetN = oldTarget;
            }
        }

        if (CC_EDITOR && !this.preview) {
            node.stopSystem();
        }

        return node;
    }
});

ParticleWrapper.prototype.schedulePriority = 1;

cc.ParticleWrapper = module.exports = ParticleWrapper;
