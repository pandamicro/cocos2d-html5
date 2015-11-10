/**
 * @module cc
 */

/****************************************************************************
 Copyright (c) 2015 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * Renders a sprite in the scene.
 * @class SpriteRenderer
 * @extends CCComponentInSG
 */
var SpriteRenderer = cc.Class({
    name: 'cc.Sprite',
    extends: require('./CCComponentInSG'),

    editor: CC_EDITOR && {
        menu: 'Sprite'
    },

    properties: {

        _texture: {
            default: '',
            url: cc.Texture2D
        },
        _atlasIndex: 0,
        _textureAtlas: '',
        _isFlippedX: false,
        _isFlippedY: false,
        _rectRotated: false,
        _textureRect: cc.rect(),

        /**
         * Texture used to render the sprite.
         * @property textureAtlas
         * @type {SpriteAtlas}
         */
        textureAtlas: {
            get: function () {
                return this._textureAtlas;
            },
            set: function (value) {
                this._textureAtlas = value;
                if (this._sgNode) {
                    this._sgNode.setTextureAtlas(value);
                }
            },
            url: cc.SpriteAtlas
        },

        /**
         * The texture of the sprite node
         * @property texture
         * @type {Texture2D}
         */
        texture: {
            get: function () {
                return this._texture;
            },
            set: function (value, force) {
                this._texture = value;

                if (this._sgNode) {
                    if (CC_EDITOR && force) {
                        this._sgNode.texture = null;
                    }
                    this._sgNode.texture = value;
                    // color cleared after reset texture, should reapply color
                    this._sgNode.setColor(this.node._color);
                    this._sgNode.setOpacity(this.node._opacity);
                }
            },
            url: cc.Texture2D
        },

        /**
         * Only for editor to calculate bounding box
         */
        localSize: {
            get: function () {
                var texture = this._sgNode ? this._sgNode.texture : null;
                if (!texture) {
                    return cc.size(0, 0);
                }
                return cc.size(texture.width, texture.height);
            },
            visible: false
        }
    },

    /**
     * Returns whether or not the texture rectangle is rotated.
     * @method isTextureRectRotated
     * @return {Boolean}
     */
    isTextureRectRotated: function () {
        return this._sgNode.isTextureRectRotated();
    },

    /**
     * Returns the index used on the TextureAtlas.
     * @method getAtlasIndex
     * @return {Number}
     */
    getAtlasIndex: function () {
        return this._atlasIndex;
    },

    /**
     * Sets the index used on the TextureAtlas.
     * @warning Don't modify this value unless you know what you are doing
     * @method setAtlasIndex
     * @param {Number} atlasIndex
     */
    setAtlasIndex: function (atlasIndex) {
        this._atlasIndex = atlasIndex;
        this._sgNode.setAtlasIndex(atlasIndex);
    },

    /**
     * Returns the rect of the cc.Sprite in points
     * @method getTextureRect
     * @return {Rect}
     */
    getTextureRect: function () {
        return this._textureRect;
    },

    /**
     * Returns the offset position of the sprite. Calculated automatically by editors like Zwoptex.
     * @method getOffsetPosition
     * @return {Vec2}
     */
    getOffsetPosition: function () {
        return this._sgNode.getOffsetPosition();
    },

    /**
     * Returns the offset position x of the sprite.
     * @return {Number}
     */
    _getOffsetX: function () {
        return this._sgNode._getOffsetX();
    },

    /**
     * Returns the offset position y of the sprite.
     * @return {Number}
     */
    _getOffsetY: function () {
        return this._sgNode._getOffsetY();
    },

    /**
     * Initializes a sprite with a SpriteFrame. The texture and rect in SpriteFrame will be applied on this sprite.<br/>
     * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself,
     * @method initWithSpriteFrame
     * @param {SpriteFrame} spriteFrame - A CCSpriteFrame object. It should includes a valid texture and a rect
     * @return {Boolean}  true if the sprite is initialized properly, false otherwise.
     */
    initWithSpriteFrame: function (spriteFrame) {
        return this._sgNode.initWithSpriteFrame(spriteFrame);
    },

    /**
     * Initializes a sprite with a sprite frame name. <br/>
     * A cc.SpriteFrame will be fetched from the cc.SpriteFrameCache by name.  <br/>
     * If the cc.SpriteFrame doesn't exist it will raise an exception. <br/>
     * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
     * @method initWithSpriteFrameName
     * @param {String} spriteFrameName - A key string that can fected a valid cc.SpriteFrame from cc.SpriteFrameCache
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     * @example {@link utils/api/cocos/docs/cocos2d/core/components/CCSpriteRenderer/initWithSpriteFrameName.js}
     */
    initWithSpriteFrameName: function (spriteFrameName) {
        return this._sgNode.initWithSpriteFrameName(spriteFrameName);
    },

    /**
     * <p>
     *    set the vertex rect.<br/>
     *    It will be called internally by setTextureRect.                           <br/>
     *    Useful if you want to create 2x images from SD images in Retina Display.  <br/>
     *    Do not call it manually. Use setTextureRect instead.  <br/>
     *    (override this method to generate "double scale" sprites)
     * </p>
     * @method setVertexRect
     * @param {Rect} rect
     */
    setVertexRect: function (rect) {
        var locRect = this._textureRect;
        locRect.x = rect.x;
        locRect.y = rect.y;
        locRect.width = rect.width;
        locRect.height = rect.height;

        this._sgNode.setVertexRect(rect);
    },

    /**
     * Sets whether the sprite is visible or not.
     * @method setVisible
     * @param {Boolean} visible
     * @override
     */
    setVisible: function (visible) {
        this.enabled = visible;
    },

    /**
     * Sets whether the sprite should be flipped horizontally or not.
     * @method setFlippedX
     * @param {Boolean} flippedX - true if the sprite should be flipped horizontally, false otherwise.
     */
    setFlippedX: function (flippedX) {
        this._isFlippedX = flippedX;
        this._sgNode.setFlippedX(flippedX);
    },

    /**
     * Sets whether the sprite should be flipped vertically or not.
     * @method setFlippedY
     * @param {Boolean} flippedY - true if the sprite should be flipped vertically, false otherwise.
     */
    setFlippedY: function (flippedY) {
        this._isFlippedY = flippedY;
        this._sgNode.setFlippedY(flippedY);
    },

    /**
     * <p>
     * Returns the flag which indicates whether the sprite is flipped horizontally or not.                      <br/>
     *                                                                                                              <br/>
     * It only flips the texture of the sprite, and not the texture of the sprite's children.                       <br/>
     * Also, flipping the texture doesn't alter the anchorPoint.                                                    <br/>
     * If you want to flip the anchorPoint too, and/or to flip the children too use:                                <br/>
     *      sprite.setScaleX(sprite.getScaleX() * -1);  <p/>
     * @method isFlippedX
     * @return {Boolean} true if the sprite is flipped horizontally, false otherwise.
     */
    isFlippedX: function () {
        return this._isFlippedX;
    },

    /**
     * <p>
     *     Return the flag which indicates whether the sprite is flipped vertically or not.                         <br/>
     *                                                                                                              <br/>
     *      It only flips the texture of the sprite, and not the texture of the sprite's children.                  <br/>
     *      Also, flipping the texture doesn't alter the anchorPoint.                                               <br/>
     *      If you want to flip the anchorPoint too, and/or to flip the children too use:                           <br/>
     *         sprite.setScaleY(sprite.getScaleY() * -1); <p/>
     * @method isFlippedY
     * @return {Boolean} true if the sprite is flipped vertically, false otherwise.
     */
    isFlippedY: function () {
        return this._isFlippedY;
    },

    // Animation

    /**
     * Changes the display frame with animation name and index.<br/>
     * The animation name will be get from the CCAnimationCache
     * @method setDisplayFrameWithAnimationName
     * @param {String} animationName
     * @param {Number} frameIndex
     */
    setDisplayFrameWithAnimationName: function (animationName, frameIndex) {
        this._sgNode.setDisplayFrameWithAnimationName(animationName, frameIndex);
    },

    /**
     * <p>
     *     Initializes a sprite with an image filename.<br/>
     *
     *     This method will find pszFilename from local file system, load its content to CCTexture2D,<br/>
     *     then use CCTexture2D to create a sprite.<br/>
     *     After initialization, the rect used will be the size of the image. The offset will be (0,0).<br/>
     *     Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
     * </p>
     * @method initWithFile
     * @param {String} filename - The path to an image file in local file system
     * @param {Rect} rect - The rectangle assigned the content area from texture.
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     */
    initWithFile: function (filename, rect) {
        this._sgNode.initWithFile(filename, rect);
    },

    /**
     * Initializes a sprite with a texture and a rect in points, optionally rotated.  <br/>
     * After initialization, the rect used will be the size of the texture, and the offset will be (0,0).<br/>
     * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
     * @method initWithTexture
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture A pointer to an existing CCTexture2D object.
     * You can use a CCTexture2D object for many sprites.
     * @param {Rect} [rect] - Only the contents inside rect of this texture will be applied for this sprite.
     * @param {Boolean} [rotated] - Whether or not the texture rectangle is rotated.
     * @param {Boolean} [counterclockwise=true] -  Whether or not the texture rectangle rotation is counterclockwise
     * (texture package is counterclockwise, spine is clockwise).
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     */
    initWithTexture: function (texture, rect, rotated, counterclockwise) {
        return this._sgNode.initWithTexture(texture, rect, rotated, counterclockwise);
    },

    // BatchNode methods
    /**
     * Updates the texture rect of the CCSprite in points.
     * @method setTextureRect
     * @param {Rect} rect a rect of texture
     * @param {Boolean} [rotated] - Whether or not the texture is rotated
     * @param {Size} [untrimmedSize] - The original pixels size of the texture
     * @param {Boolean} [needConvert] - contentScaleFactor switch
     */
    setTextureRect: function (rect, rotated, untrimmedSize, needConvert) {
        var _t = this;
        _t._rectRotated = rotated || false;
        _t.node.setContentSize(untrimmedSize || rect);
        _t.setVertexRect(rect);

        var relativeOffsetX = _t._sgNode._unflippedOffsetPositionFromCenter.x,
            relativeOffsetY = _t._sgNode._unflippedOffsetPositionFromCenter.y;

        if (_t._flippedX)
            relativeOffsetX = -relativeOffsetX;
        if (_t._flippedY)
            relativeOffsetY = -relativeOffsetY;

        var locRect = _t._textureRect;
        _t._offsetPosition.x = relativeOffsetX + (_t.node._contentSize.width - locRect.width) / 2;
        _t._offsetPosition.y = relativeOffsetY + (_t.node._contentSize.height - locRect.height) / 2;

        this._sgNode.setTextureRect(rect, rotated, untrimmedSize, needConvert);
    },

    // Frames
    /**
     * Sets a new sprite frame to the sprite.
     * @method setSpriteFrame
     * @param {SpriteFrame|String} newFrame
     */
    setSpriteFrame: function (newFrame) {
        this._sgNode.setSpriteFrame(newFrame);
    },

    /**
     * Returns the current displayed frame.
     * @method getSpriteFrame
     * @return {SpriteFrame}
     */
    getSpriteFrame: function () {
        return this._sgNode.getSpriteFrame();
    },

    /**
     * Sets a new display frame to the sprite.
     * @method setDisplayFrame
     * @param {SpriteFrame|String} newFrame
     * @deprecated
     */
    setDisplayFrame: function(newFrame){
        this._sgNode.setDisplayFrame(newFrame);
    },

    /**
     * Returns the current displayed frame.
     * @method displayFrame
     * @deprecated since 3.4, please use getSpriteFrame instead
     * @return {SpriteFrame}
     */
    displayFrame: function () {
        return this.getSpriteFrame();
    },

    /**
     * Returns whether or not a cc.SpriteFrame is being displayed
     * @method isFrameDisplayed
     * @param {SpriteFrame} frame
     * @return {Boolean}
     */
    isFrameDisplayed: function(frame){
        return this._sgNode.isFrameDisplayed(frame);
    },

    _createSgNode: function () {
        var sprite = new cc.Sprite();
        sprite.setAnchorPoint(0, 1);

        if (this._texture) {
            sprite.texture = this._texture;
            //if (cc.sys.isNative) {
            //    // jsb Texture will not save url, so we save manually.
            //    sprite.texture.url = this._texture;
            //}
        }

        return sprite;
    },
});

var misc = require('../utils/misc');
var SameNameGetSets = ['textureAtlas', 'texture', 'atlasIndex'];
var DiffNameGetSets = {
    offsetX: ['_getOffsetX'],
    offsetY: ['_getOffsetY'],
    flippedX: ['isFlippedX', 'setFlippedX'],
    flippedY: ['isFlippedY', 'setFlippedY'],
    textureRectRotated: ['isTextureRectRotated'],
};
misc.propertyDefine(SpriteRenderer, SameNameGetSets, DiffNameGetSets);

/**
 * The offset position x of the sprite.
 * @property offsetX
 * @type {Number}
 */

/**
 * The offset position y of the sprite.
 * @property offsetY
 * @type {Number}
 */

cc.SpriteRenderer = module.exports = SpriteRenderer;
