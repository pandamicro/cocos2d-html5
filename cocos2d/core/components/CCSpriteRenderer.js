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
 * @class
 * @name cc.SpriteRenderer
 * @extend cc.CCComponentInSG
 */
var SpriteRenderer = cc.Class({
    name: 'cc.Sprite',
    extends: require('./CCComponentInSG'),

    properties: {
        _textureAtlas: {
            default: '',
            url: cc.SpriteAtlas
        },
        /**
         * Texture used to render the sprite.
         * @property textureAtlas
         * @type {Number}
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
        _texture: {
            default: '',
            url: cc.TextureAsset
        },
        texture: {
            get: function () {
                return this._texture;
            },
            set: function (value) {
                this._texture = value;

                if (this._sgNode) {
                    this._sgNode.texture = value;
                    // color cleared after reset texture, should reapply color
                    this._sgNode.setColor(this.node._color);
                    this._sgNode.setOpacity(this.node._opacity / 255);
                }
            },
            url: cc.TextureAsset
        }
    },

    /**
     * Returns whether or not the texture rectangle is rotated.
     * @return {Boolean}
     */
    isTextureRectRotated: function () {
        if (this._sgNode) {
            return this._sgNode.isTextureRectRotated()
        }
        return false;
    },

    /**
     * Returns the index used on the TextureAtlas.
     * @return {Number}
     */
    getAtlasIndex: function () {
        if (this._sgNode) {
            return this._sgNode.getAtlasIndex();
        }
        return 0;
    },

    /**
     * Sets the index used on the TextureAtlas.
     * @warning Don't modify this value unless you know what you are doing
     * @param {Number} atlasIndex
     */
    setAtlasIndex: function (atlasIndex) {
        if (this._sgNode) {
            this._sgNode.setAtlasIndex(atlasIndex);
        }
    },

    /**
     * Returns the rect of the cc.Sprite in points
     * @return {cc.Rect}
     */
    getTextureRect: function () {
        if (this._sgNode) {
            return this._sgNode.getTextureRect();
        }
        return cc.rect();
    },

    /**
     * Returns the offset position of the sprite. Calculated automatically by editors like Zwoptex.
     * @return {cc.Vec2}
     */
    getOffsetPosition: function () {
        if (this._sgNode) {
            return this._sgNode.getOffsetPosition();
        }
        return cc.p();
    },

    /**
     * Returns the offset position x of the sprite.
     * @return {float}
     */
    getOffsetX: function () {
       return this.getOffsetPosition().x;
    },

    /**
     * Returns the offset position y of the sprite.
     * @return {float}
     */
    getOffsetY: function () {
        return this.getOffsetPosition().y;
    },

    /**
     * Initializes a sprite with a SpriteFrame. The texture and rect in SpriteFrame will be applied on this sprite.<br/>
     * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself,
     * @param {cc.SpriteFrame} spriteFrame A CCSpriteFrame object. It should includes a valid texture and a rect
     * @return {Boolean}  true if the sprite is initialized properly, false otherwise.
     */
    initWithSpriteFrame: function (spriteFrame) {
        if (this._sgNode) {
            return this._sgNode.initWithSpriteFrame(spriteFrame);
        }
        return false;
    },

    /**
     * Initializes a sprite with a sprite frame name. <br/>
     * A cc.SpriteFrame will be fetched from the cc.SpriteFrameCache by name.  <br/>
     * If the cc.SpriteFrame doesn't exist it will raise an exception. <br/>
     * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
     * @param {String} spriteFrameName A key string that can fected a valid cc.SpriteFrame from cc.SpriteFrameCache
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     * @example
     * var sprite = new cc.Sprite();
     * sprite.initWithSpriteFrameName("grossini_dance_01.png");
     */
    initWithSpriteFrameName: function (spriteFrameName) {
        if (this._sgNode) {
            return this._sgNode.initWithSpriteFrameName(spriteFrameName);
        }
        return false;
    },

    /**
     * Tell the sprite to use batch node render.
     * @param {cc.SpriteBatchNode} batchNode
     */
    useBatchNode: function (batchNode) {
        if (this._sgNode) {
            this._sgNode.useBatchNode(batchNode);
        }
    },

    /**
     * <p>
     *    set the vertex rect.<br/>
     *    It will be called internally by setTextureRect.                           <br/>
     *    Useful if you want to create 2x images from SD images in Retina Display.  <br/>
     *    Do not call it manually. Use setTextureRect instead.  <br/>
     *    (override this method to generate "double scale" sprites)
     * </p>
     * @param {cc.Rect} rect
     */
    setVertexRect: function (rect) {
        if (this._sgNode) {
            this._sgNode.setVertexRect(rect);
        }
    },

    /**
     * Sets whether the sprite is visible or not.
     * @param {Boolean} visible
     * @override
     */
    setVisible: function (visible) {
        this.enabled = visible;
    },

    /**
     * Sets whether ignore anchor point for positioning
     * @param {Boolean} relative
     * @override
     */
    ignoreAnchorPointForPosition: function (relative) {
        if (this._sgNode) {
            this._sgNode.ignoreAnchorPointForPosition(rect);
        }
    },

    /**
     * Sets whether the sprite should be flipped horizontally or not.
     * @param {Boolean} flippedX true if the sprite should be flipped horizontally, false otherwise.
     */
    setFlippedX: function (flippedX) {
        if (this._sgNode) {
            this._sgNode.setFlippedX(flippedX);
        }
    },

    /**
     * Sets whether the sprite should be flipped vertically or not.
     * @param {Boolean} flippedY true if the sprite should be flipped vertically, false otherwise.
     */
    setFlippedY: function (flippedY) {
        if (this._sgNode) {
            this._sgNode.setFlippedY(flippedY);
        }
    },

    /**
     * <p>
     * Returns the flag which indicates whether the sprite is flipped horizontally or not.                      <br/>
     *                                                                                                              <br/>
     * It only flips the texture of the sprite, and not the texture of the sprite's children.                       <br/>
     * Also, flipping the texture doesn't alter the anchorPoint.                                                    <br/>
     * If you want to flip the anchorPoint too, and/or to flip the children too use:                                <br/>
     *      sprite.setScaleX(sprite.getScaleX() * -1);  <p/>
     * @return {Boolean} true if the sprite is flipped horizontally, false otherwise.
     */
    isFlippedX: function () {
        if (this._sgNode) {
            this._sgNode.isFlippedX();
        }
        return false;
    },

    /**
     * <p>
     *     Return the flag which indicates whether the sprite is flipped vertically or not.                         <br/>
     *                                                                                                              <br/>
     *      It only flips the texture of the sprite, and not the texture of the sprite's children.                  <br/>
     *      Also, flipping the texture doesn't alter the anchorPoint.                                               <br/>
     *      If you want to flip the anchorPoint too, and/or to flip the children too use:                           <br/>
     *         sprite.setScaleY(sprite.getScaleY() * -1); <p/>
     * @return {Boolean} true if the sprite is flipped vertically, false otherwise.
     */
    isFlippedY: function () {
        if (this._sgNode) {
            this._sgNode.isFlippedY();
        }
        return false;
    },

    // Animation

    /**
     * Changes the display frame with animation name and index.<br/>
     * The animation name will be get from the CCAnimationCache
     * @param {String} animationName
     * @param {Number} frameIndex
     */
    setDisplayFrameWithAnimationName: function (animationName, frameIndex) {
        if (this._sgNode) {
            this._sgNode.setDisplayFrameWithAnimationName(animationName, frameIndex);
        }
    },

    /**
     * Returns the batch node object if this sprite is rendered by cc.SpriteBatchNode
     * @returns {cc.SpriteBatchNode|null} The cc.SpriteBatchNode object if this sprite is rendered by
     * cc.SpriteBatchNode, null if the sprite isn't used batch node.
     */
    getBatchNode: function () {
        if (this._sgNode) {
            return this._sgNode.getBatchNode();
        }
        return null;
    },

    /**
     * Sets the batch node to sprite
     * @function
     * @param {cc.SpriteBatchNode|null} spriteBatchNode
     * @example
     *  var batch = new cc.SpriteBatchNode("Images/grossini_dance_atlas.png", 15);
     *  var sprite = new cc.Sprite(batch.texture, cc.rect(0, 0, 57, 57));
     *  batch.addChild(sprite);
     *  layer.addChild(batch);
     */
    setBatchNode: function (spriteBatchNode) {
        if (this._sgNode) {
            this._sgNode.setBatchNode(spriteBatchNode);
        }
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
     * @param {String} filename The path to an image file in local file system
     * @param {cc.Rect} rect The rectangle assigned the content area from texture.
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     */
    initWithFile: function (filename, rect) {
        if (this._sgNode) {
            this._sgNode.initWithFile(filename, rect);
        }
    },

    /**
     * Initializes a sprite with a texture and a rect in points, optionally rotated.  <br/>
     * After initialization, the rect used will be the size of the texture, and the offset will be (0,0).<br/>
     * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
     * @function
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture A pointer to an existing CCTexture2D object.
     * You can use a CCTexture2D object for many sprites.
     * @param {cc.Rect} [rect] Only the contents inside rect of this texture will be applied for this sprite.
     * @param {Boolean} [rotated] Whether or not the texture rectangle is rotated.
     * @param {Boolean} [counterclockwise=true] Whether or not the texture rectangle rotation is counterclockwise
     * (texture package is counterclockwise, spine is clockwise).
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     */
    initWithTexture: function (texture, rect, rotated, counterclockwise) {
        if (this._sgNode) {
           return this._sgNode.initWithTexture(texture, rect, rotated, counterclockwise);
        }
        return false;
    },

    // BatchNode methods
    /**
     * Updates the texture rect of the CCSprite in points.
     * @function
     * @param {cc.Rect} rect a rect of texture
     * @param {Boolean} [rotated] Whether or not the texture is rotated
     * @param {cc.Size} [untrimmedSize] The original pixels size of the texture
     * @param {Boolean} [needConvert] contentScaleFactor switch
     */
    setTextureRect: function (rect, rotated, untrimmedSize, needConvert) {
        if (this._sgNode) {
            this._sgNode.setTextureRect(rect, rotated, untrimmedSize, needConvert);
        }
    },

    /**
     * Updates the quad according the the rotation, position, scale values.
     * @function
     */
    updateTransform: function(){
        if (this._sgNode) {
            this._sgNode.updateTransform();
        }
    },

    // Frames
    /**
     * Sets a new sprite frame to the sprite.
     * @function
     * @param {cc.SpriteFrame|String} newFrame
     */
    setSpriteFrame: function (newFrame) {
        if (this._sgNode) {
            this._sgNode.setSpriteFrame(newFrame);
        }
    },

    /**
     * Returns the current displayed frame.
     * @return {cc.SpriteFrame}
     */
    getSpriteFrame: function () {
        if (this._sgNode) {
            return this._sgNode.getSpriteFrame();
        }
        return null
    },

    /**
     * Sets a new display frame to the sprite.
     * @param {cc.SpriteFrame|String} newFrame
     * @deprecated
     */
    setDisplayFrame: function(newFrame){
        if (this._sgNode) {
            this._sgNode.setDisplayFrame(newFrame);
        }
    },

    /**
     * Returns the current displayed frame.
     * @deprecated since 3.4, please use getSpriteFrame instead
     * @return {cc.SpriteFrame}
     */
    displayFrame: function () {
        return this.getSpriteFrame();
    },

    /**
     * Returns whether or not a cc.SpriteFrame is being displayed
     * @function
     * @param {cc.SpriteFrame} frame
     * @return {Boolean}
     */
    isFrameDisplayed: function(frame){
        if (this._sgNode) {
            return this._sgNode.isFrameDisplayed(frame);
        }
        return false;
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

(function () {

    var misc = require('../utils/misc');
    var SameNameGetSets = ['textureAtlas', 'texture'];
    var DiffNameGetSets = {
        atlasIndex: ['getAtlasIndex', 'setAtlasIndex'],
        offsetX: ['getOffsetX'],
        offsetY: ['getOffsetY'],
        flippedX: ['isFlippedX', 'setFlippedX'],
        flippedY: ['isFlippedY', 'setFlippedY'],
        textureRectRotated: ['isTextureRectRotated'],
    };
    misc.propertyDefine(SpriteRenderer, SameNameGetSets, DiffNameGetSets);

})();

cc.SpriteRenderer = module.exports = SpriteRenderer;
