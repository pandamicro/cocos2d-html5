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

EventTarget = require("../cocos2d/core/event/event-target");

cc.Label = cc.Node.extend({
    _hAlign: 0, //0 left, 1 center, 2 right
    _vAlign: 0, //0 bottom,1 center, 2 top
    _string: "",
    _fontSize: 0,
    _overFlow: 0, //0 shrink, 1 clamp 2, resize to content
    _isWrapText: true,
    _spacingX : 0,
    _spacingY : 0,

    _labelSkinDirty: true,
    _labelIsTTF: true,
    _fontHandle: "",

    //fontHandle it is a font name or bmfont file.
    ctor : function(fontHandle, isTTF) {
        fontHandle = fontHandle || "";
        this._fontHandle = fontHandle;
        isTTF = isTTF || true;
        this._labelIsTTF = isTTF;
        cc.Node.prototype.ctor.call(this);
        this.setContentSize(cc.size(128,128));
    },

    setHorizontalAlign: function (align) {
        if(this._hAlign === align) return;
        this._hAlign = align;
        this._notifyLabelSkinDirty();
    },

    getHorizontalAlign: function () {
        return this._hAlign;
    },

    setVerticalAlign: function (align) {
        if(this._vAlign === align) return;
        this._vAlign = align;
        this._notifyLabelSkinDirty();
    },

    getVerticalAlign: function () {
        return this._vAlign;
    },

    setString: function(string) {
        if(this._string === string) return;
        this._string = string;
        this._notifyLabelSkinDirty();
    },

    getString: function() {
        return this._string;
    },

    enableWrapText: function(enabled) {
        if(this._isWrapText === enabled) return;
        this._isWrapText = enabled;
        this._notifyLabelSkinDirty();
    },

    isWrapTextEnabled: function() {
        return this._isWrapText;
    },

    setFontSize: function(fntSize) {
        if(this._fontSize === fntSize) return;
        this._fontSize = fntSize;
        this._notifyLabelSkinDirty();
    },

    getFontSize: function() {
        return this._fontSize;
    },

    setOverflow: function(overflow) {
        if(this._overFlow === overflow) return;
        this._overFlow = overflow;
        this._notifyLabelSkinDirty();
    },

    getOverflow: function() {
        return this._overFlow;
    },

    setSpacingX: function(spacing) {
        if(this._spacingX === spacing) return;
        this._spacingX == spacing;
        this._notifyLabelSkinDirty();
    },

    setSpacingY: function(spacing) {
        if(this._spacingY === spacing) return;
        this._spacingY == spacing;
        this._notifyLabelSkinDirty();
    },

    getSpacingX: function() {
        return this._spacingX;
    },

    getSpacingY: function() {
        return this._spacingY;
    },

    setContentSize : function(size){
        if (cc.sizeEqualToSize(this._contentSize,size))
        {
            return;
        }
        cc.Node.prototype.setContentSize.call(this, size);
        this._notifyLabelSkinDirty();
    },

    _notifyLabelSkinDirty : function() {
        this._labelSkinDirty = true;
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.textDirty);
    },
    _createRenderCmd: function () {

        if(this._labelIsTTF) {
            if (cc._renderType === cc.game.RENDER_TYPE_WEBGL)
                return new cc.Label.TTFWebGLRenderCmd(this);
            else
                return new cc.Label.TTFCanvasRenderCmd(this);
        }
        else {
            //todo:add label bmfont here
        }
    }
});

cc.Label.HorizontalAlign = {LEFT: 0, CENTER: 1, RIGHT: 2};
cc.Label.VerticalAlign = {BOTTOM: 0, CENTER: 1, TOP: 2};
cc.Label.Overflow = {SHRINK: 0, CLAMP: 1, RESIZE: 2};