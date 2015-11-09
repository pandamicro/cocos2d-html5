/****************************************************************************
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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

(function() {
    ccui.Scale9Sprite.CanvasRenderCmd = function (renderable) {
        cc.Node.CanvasRenderCmd.call(this, renderable);
        //this._cachedParent = null;
        //this._cacheDirty = false;
        this._needDraw = true;
        this._state = ccui.Scale9Sprite.state.NORMAL;
        this._needSwitchTexture = false;
        //this._state = ccui.Scale9Sprite.state.NORMAL;

        //var node = this._node;
        //var locCacheCanvas = this._cacheCanvas = document.createElement('canvas');
        //locCacheCanvas.width = 1;
        //locCacheCanvas.height = 1;
        //this._cacheContext = new cc.CanvasContextWrapper(locCacheCanvas.getContext("2d"));
        //var locTexture = this._cacheTexture = new cc.Texture2D();
        //locTexture.initWithElement(locCacheCanvas);
        //locTexture.handleLoadedTexture();
        //this._cacheSprite = new cc.Sprite(locTexture);
        //this._cacheSprite.setAnchorPoint(0,0);
        //node.addChild(this._cacheSprite);
    };

    var proto = ccui.Scale9Sprite.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = ccui.Scale9Sprite.CanvasRenderCmd;

    //proto.visit = function(parentCmd){
    //    var node = this._node;
    //    if(!node._visible)
    //        return;
    //
    //    if (node._positionsAreDirty) {
    //        node._updatePositions();
    //        node._positionsAreDirty = false;
    //        node._scale9Dirty = true;
    //    }
    //
    //    this._cacheScale9Sprite();
    //
    //    node._scale9Dirty = false;
    //    cc.Node.CanvasRenderCmd.prototype.visit.call(this, parentCmd);
    //};

    proto.transform = function(parentCmd){
        cc.Node.CanvasRenderCmd.prototype.transform.call(this, parentCmd);
        //if (node._positionsAreDirty) {
        //    node._updatePositions();
        //    node._positionsAreDirty = false;
        //    node._scale9Dirty = true;
        //}
        //this._cacheScale9Sprite();
        //
        //var children = node._children;
        //for(var i=0; i<children.length; i++){
        //    children[i].transform(this, true);
        //}
    };

    proto._updateDisplayOpacity = function(parentOpacity){
        cc.Node.WebGLRenderCmd.prototype._updateDisplayOpacity.call(this, parentOpacity);
        var node = this._node;
        var scale9Image = node._scale9Image;
        var childrenSize= node._children.length;
        if (node._cascadeOpacityEnabled)
        {
            for(var i = 0; i< childrenSize; ++i)
            {
                node._children[i]._renderCmd._updateDisplayOpacity(this._displayedOpacity);
            }
            this._displayedOpacity = node._realOpacity * parentOpacity/255.0;
            this._updateColor();

            if (scale9Image != null)
            {
                scale9Image._renderCmd._updateDisplayOpacity(this._displayedOpacity);
            }
        }
        else
        {
            node._displayedOpacity = node._realOpacity;

            for(var i = 0; i< childrenSize; ++i)
            {
                node._children[i]._renderCmd._updateDisplayOpacity(255);
            }

            if (scale9Image != null)
            {
                scale9Image._renderCmd._updateDisplayOpacity(255);
            }
        }
    };

    proto._updateDisplayColor = function(parentColor){
        cc.Node.WebGLRenderCmd.prototype._updateDisplayColor.call(this, parentColor);
        var node = this._node;
        var scale9Image = node._scale9Image;

        var childrenSize= node._children.length;
        if (this._cascadeColorEnabled)
        {
            node._displayedColor.r = node._realColor.r * parentColor.r/255.0;
            node._displayedColor.g = node._realColor.g * parentColor.g/255.0;
            node._displayedColor.b = node._realColor.b * parentColor.b/255.0;
            this._updateColor();
            for(var i = 0; i< childrenSize; ++i)
            {
                node._children[i]._renderCmd._updateDisplayColor(node._displayedColor);
            }

            if (scale9Image)
            {
                scale9Image._renderCmd._updateDisplayColor(node._displayedColor);
            }

        }
        else
        {
            for(var i = 0; i< childrenSize; ++i)
            {
                node._children[i]._renderCmd._updateDisplayColor(cc.Color.WHITE);
            }

            if (scale9Image)
            {
                scale9Image._renderCmd._updateDisplayColor(cc.Color.WHITE);
            }
        }
    };

    //proto._cacheScale9Sprite = function() {
    //    var node = this._node;
    //    if(!node._scale9Image)
    //        return;
    //
    //    var locScaleFactor = cc.contentScaleFactor();
    //    var size = node._contentSize;
    //    var sizeInPixels = cc.size(size.width * locScaleFactor, size.height * locScaleFactor);
    //
    //    var locCanvas = this._cacheCanvas, wrapper = this._cacheContext, locContext = wrapper.getContext();
    //
    //    var contentSizeChanged = false;
    //    if(locCanvas.width !== sizeInPixels.width || locCanvas.height !== sizeInPixels.height){
    //        locCanvas.width = sizeInPixels.width;
    //        locCanvas.height = sizeInPixels.height;
    //        contentSizeChanged = true;
    //    }
    //
    //    //begin cache
    //    cc.renderer._turnToCacheMode(node.__instanceId);
    //
    //    if(node._scale9Enabled) {
    //        var locRenderers = node._renderers;
    //        node._setRenderersPosition();
    //        var protectChildLen = locRenderers.length;
    //        for(var j=0; j < protectChildLen; j++) {
    //            var renderer = locRenderers[j];
    //            if(renderer) {
    //                var tempCmd = renderer._renderCmd;
    //                tempCmd.updateStatus();
    //                cc.renderer.pushRenderCommand(tempCmd);
    //            }
    //            else
    //                break;
    //        }
    //    }
    //    else {
    //        var tempCmd = node._scale9Image._renderCmd;
    //        node._adjustScale9ImagePosition();
    //        node._adjustScale9ImageScale();
    //        tempCmd.updateStatus();
    //        cc.renderer.pushRenderCommand(node._scale9Image._renderCmd);
    //    }
    //    //draw to cache canvas
    //    var selTexture = node._scale9Image.getTexture();
    //    if(selTexture && this._state === ccui.Scale9Sprite.state.GRAY)
    //        selTexture._switchToGray(true);
    //    locContext.setTransform(1, 0, 0, 1, 0, 0);
    //    locContext.clearRect(0, 0, sizeInPixels.width, sizeInPixels.height);
    //    cc.renderer._renderingToCacheCanvas(wrapper, node.__instanceId, locScaleFactor, locScaleFactor);
    //    if(selTexture && this._state === ccui.Scale9Sprite.state.GRAY)
    //        selTexture._switchToGray(false);
    //
    //    if(contentSizeChanged)
    //        this._cacheSprite.setTextureRect(cc.rect(0,0, size.width, size.height));
    //
    //    if(!this._cacheSprite.getParent())
    //        node.addChild(this._cacheSprite, -1);
    //};

    proto.setState = function(state){
        if(this._state == state) return;

        var locScale9Image = this._node._scale9Image;
        if(!locScale9Image)
            return;
        this._state = state;
        this._needSwitchTexture = true;
        //this._cacheScale9Sprite();
    };

    proto.rendering = function (ctx, scaleX, scaleY) {
        var node = this._node;
        if(!node._scale9Enabled)
            return;
        var alpha = this._displayedOpacity / 255;
        var locTexture = null;
        if(node.getSprite()) locTexture = node.getSprite()._texture;
        if (!node.textureLoaded() || this._displayedOpacity === 0)
            return;

        var wrapper = ctx || cc._renderContext, context = wrapper.getContext();
        wrapper.setTransform(this._worldTransform, scaleX, scaleY);
        wrapper.setCompositeOperation(node._blendFunc);
        wrapper.setGlobalAlpha(alpha);

        if(locTexture != null) {
            if(this._needSwitchTexture) {
                this._needSwitchTexture = false;
                if (cc.Scale9Sprite.state.Normal == this._state) {
                    locTexture._switchToGray(false);
                }
                else{
                    locTexture._switchToGray(true);
                }
            }
            if(node._quadsDirty){
                node._cleanupSlicedSprites();
                node._createSlicedSprites();
                node._quadsDirty = false;
            }

            var quads = node._quads;
            for( var i = 0; i < quads.length; ++i)
            {
                var sx,sy,sw,sh;
                var x, y, w,h;

                x = quads[i]._bl.vertices.x;
                y = quads[i]._bl.vertices.y;
                w = quads[i]._tr.vertices.x - quads[i]._bl.vertices.x;
                h = quads[i]._tr.vertices.y - quads[i]._bl.vertices.y;
                y = - y - h;

                var textureWidth = locTexture.getPixelWidth(); textureHeight = locTexture.getPixelHeight();

                sx = quads[i]._bl.texCoords.u * textureWidth;
                sy = quads[i]._bl.texCoords.v * textureHeight;
                sw = (quads[i]._tr.texCoords.u - quads[i]._bl.texCoords.u) * textureWidth;
                sh = (quads[i]._tr.texCoords.v - quads[i]._bl.texCoords.v) * textureHeight;

                x = x * scaleX;
                y = y * scaleY;
                w = w * scaleX;
                h = h * scaleY;

                //cc.log("render scale 9 with" + x + " " + y + " " + w + " " + h);
                image = locTexture._htmlElementObj;
                if (locTexture._pattern !== "") {
                    wrapper.setFillStyle(context.createPattern(image, locTexture._pattern));
                    context.fillRect(x, y, w, h);
                } else {
                    context.drawImage(image,
                        sx, sy, sw, sh,
                        x, y, w, h);
                }
            }

        }
        cc.g_NumberOfDraws = cc.g_NumberOfDraws + 9;
    }
})();