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
    if(!cc.Node.WebGLRenderCmd)
        return;
    ccui.Scale9Sprite.WebGLRenderCmd = function (renderable) {
        cc.Node.WebGLRenderCmd.call(this, renderable);
        this._needDraw = true;
        this._cachedParent = null;
        this._cacheDirty = false;
        this._quadWebBuffer = cc._renderContext.createBuffer();
    };

    var proto = ccui.Scale9Sprite.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = ccui.Scale9Sprite.WebGLRenderCmd;

    proto.rendering = function (ctx){
        var node = this._node;
        if(!node._scale9Enabled)
            return;

        var locTexture = null;
        if(node.getSprite()) locTexture = node.getSprite()._texture;
        if (!node.textureLoaded() || this._displayedOpacity === 0)
            return;
        var needRebuildWebBuffer = false;
        if(node._quadsDirty){
            node._cleanupSlicedSprites();
            node._createSlicedSprites();
            node._quadsDirty = false;
            needRebuildWebBuffer = true;
        }
        var gl = ctx || cc._renderContext ;

        if(locTexture != null)
        {
            this._shaderProgram.use();
            this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);

            cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);
            //optimize performance for javascript
            cc.glBindTexture2DN(0, locTexture);                   // = cc.glBindTexture2D(locTexture);
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);

            var quads = node._quads;
            var bufferOffset = 0;
            var quadsLength = quads.length;
            if(quadsLength == 0) return;
            if (needRebuildWebBuffer)
            {
                gl.bufferData(gl.ARRAY_BUFFER,quads[0].arrayBuffer.byteLength * quads.length, gl.DYNAMIC_DRAW);
                for(var i = 0; i < quads.length; ++i){
                    gl.bufferSubData(gl.ARRAY_BUFFER, bufferOffset,quads[i].arrayBuffer);
                    bufferOffset = bufferOffset + quads[i].arrayBuffer.byteLength;
                }
            }
            bufferOffset = 0;
            for(var i = 0; i < quads.length; ++i)
            {
                gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0 + bufferOffset);                   //cc.VERTEX_ATTRIB_POSITION
                gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 24, 12 + bufferOffset);           //cc.VERTEX_ATTRIB_COLOR
                gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16 + bufferOffset);                  //cc.VERTEX_ATTRIB_TEX_COORDS
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                bufferOffset = bufferOffset + quads[i].arrayBuffer.byteLength;
            }

            cc.g_NumberOfDraws += quads.length;

        }

        //do scale9 draw
        //{
        //    cc.log("I am doing the real scale9 draw");
        //}
    };

    proto.transform = function(parentCmd, recursive){
        var node = this._node;
        cc.Node.WebGLRenderCmd.prototype.transform.call(this, parentCmd, recursive);
        //if (node._positionsAreDirty) {
        //    node._updatePositions();
        //    node._positionsAreDirty = false;
        //    node._scale9Dirty = true;
        //}
        //if(node._scale9Enabled) {
        //    var locRenderers = node._renderers;
        //    var protectChildLen = locRenderers.length;
        //    for(var j=0; j < protectChildLen; j++) {
        //        var pchild = locRenderers[j];
        //        if(pchild) {
        //            var tempCmd = pchild._renderCmd;
        //            tempCmd.transform(this, true);
        //        }
        //        else
        //            break;
        //    }
        //}
        //else {
        //    node._adjustScale9ImagePosition();
        //    node._scale9Image._renderCmd.transform(this, true);
        //}
        //if(node._scale9Image)
        //{
        //    node._scale9Image._renderCmd.transform(this, true);
        //}
    };

    proto._syncStatus = function (parentCmd){
        cc.Node.WebGLRenderCmd.prototype._syncStatus.call(this, parentCmd);
        this._updateDisplayColor(this._displayedColor);
        this._updateDisplayOpacity(this._displayedOpacity);
    };

    proto._updateDisplayColor = function(parentColor){
        cc.Node.WebGLRenderCmd.prototype._updateDisplayColor.call(this, parentColor);
        var node = this._node;
        var scale9Image = node._scale9Image;



        if (this._cascadeColorEnabled)
        {
            node._displayedColor.r = node._realColor.r * parentColor.r/255.0;
            node._displayedColor.g = node._realColor.g * parentColor.g/255.0;
            node._displayedColor.b = node._realColor.b * parentColor.b/255.0;
            this._updateColor();
            var childrenSize= node._children.length;
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
            var childrenSize= node._children.length;
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

    proto._updateDisplayOpacity = function(parentOpacity){
        cc.Node.WebGLRenderCmd.prototype._updateDisplayOpacity.call(this, parentOpacity);
        var node = this._node;
        var scale9Image = node._scale9Image;

        if (node._cascadeOpacityEnabled)
        {
            var childrenSize= node._children.length;
            for(var i = 0; i< childrenSize; ++i)
            {
                node._children[i]._renderCmd._updateDisplayOpacity(node._displayedOpacity);
            }
            node._displayedOpacity = node._realOpacity * parentOpacity/255.0;
            this._updateColor();

            if (scale9Image != null)
            {
                scale9Image._renderCmd._updateDisplayOpacity(node._displayedOpacity);
            }
        }
        else
        {
            node._displayedOpacity = node._realOpacity;

            var childrenSize= node._children.length;
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

    proto.setState = function (state) {
        var node = this._node;
        var scale9Image = this._node._scale9Image;
        if(!node.isScale9Enabled)
        {
            if (state === ccui.Scale9Sprite.state.NORMAL) {
                scale9Image.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
            } else if (state === ccui.Scale9Sprite.state.GRAY) {
                scale9Image.setShaderProgram(ccui.Scale9Sprite.WebGLRenderCmd._getGrayShaderProgram());
            }
        }
        else
        {
            if (state === ccui.Scale9Sprite.state.NORMAL) {
                node.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
            } else if (state === ccui.Scale9Sprite.state.GRAY) {
                node.setShaderProgram(ccui.Scale9Sprite.WebGLRenderCmd._getGrayShaderProgram());
            }
        }
    };

    ccui.Scale9Sprite.WebGLRenderCmd._grayShaderProgram = null;
    ccui.Scale9Sprite.WebGLRenderCmd._getGrayShaderProgram = function(){
        var grayShader = ccui.Scale9Sprite.WebGLRenderCmd._grayShaderProgram;
        if(grayShader)
            return grayShader;

        grayShader = new cc.GLProgram();
        grayShader.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_COLOR_VERT, ccui.Scale9Sprite.WebGLRenderCmd._grayShaderFragment);
        grayShader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
        grayShader.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
        grayShader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
        grayShader.link();
        grayShader.updateUniforms();

        ccui.Scale9Sprite.WebGLRenderCmd._grayShaderProgram = grayShader;
        return grayShader;
    };

    ccui.Scale9Sprite.WebGLRenderCmd._grayShaderFragment =
        "precision lowp float;\n"
        + "varying vec4 v_fragmentColor; \n"
        + "varying vec2 v_texCoord; \n"
        + "void main() \n"
        + "{ \n"
        + "    vec4 c = texture2D(CC_Texture0, v_texCoord); \n"
        + "    gl_FragColor.xyz = vec3(0.2126*c.r + 0.7152*c.g + 0.0722*c.b); \n"
        +"     gl_FragColor.w = c.w ; \n"
        + "}";
})();