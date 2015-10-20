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
                    this._updateColor();
                }
            },
            url: cc.TextureAsset
        }
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

cc.addComponentMenu(SpriteRenderer, 'Sprite Renderer');
cc.SpriteRenderer = module.exports = SpriteRenderer;
