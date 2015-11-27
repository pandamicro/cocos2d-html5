/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
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

 Use any of these editors to generate BMFonts:
 http://glyphdesigner.71squared.com/ (Commercial, Mac OS X)
 http://www.n4te.com/hiero/hiero.jnlp (Free, Java)
 http://slick.cokeandcode.com/demos/hiero.jnlp (Free, Java)
 http://www.angelcode.com/products/bmfont/ (Free, Windows only)
 ****************************************************************************/

(function(){
    cc.Label.TTFWebGLRenderCmd = function(renderableObject){
        cc.Node.WebGLRenderCmd.call(this, renderableObject);
        this._needDraw = true;
        this._labelTexture = null;
        this._labelCanvas = document.createElement("canvas");
        this._labelCanvas.width = 1;
        this._labelCanvas.height = 1;
        this._labelContext = this._labelCanvas.getContext("2d");
        this._quad = new cc.V3F_C4B_T2F_Quad();
        this._quadDirty = true;
        this._quadWebBuffer = cc._renderContext.createBuffer();
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        this._splitedStrings = null;
        this._drawFontsize = 0;
    };

    var proto = cc.Label.TTFWebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.Label.TTFWebGLRenderCmd;

    proto._rebuildLabelSkin = function() {
        if(this._node._labelSkinDirty) {
            this._bakeLabel();
            this._prepareQuad();
            this._node._labelSkinDirty = false;
        }
    };
    proto.rendering = function (ctx) {

        this._rebuildLabelSkin();

        var gl = ctx || cc._renderContext ;
        this._shaderProgram.use();
        this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
        cc.glBlendFunc(cc.BlendFunc._alphaNonPremultiplied().src,cc.BlendFunc._alphaNonPremultiplied().dst);
        cc.glBindTexture2DN(0,this._labelTexture);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
        if (this._quadDirty) {
            gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.DYNAMIC_DRAW);
            this._quadDirty = false;
        }
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);                   //cc.VERTEX_ATTRIB_POSITION
        gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 24, 12);           //cc.VERTEX_ATTRIB_COLOR
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);                  //cc.VERTEX_ATTRIB_TEX_COORDS
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    proto._splitString = function() {
        var node = this._node;
        //splite string by \n;

    };
    proto._getLineHeight = function() {
        //todo refine it
        var nodeSpacingY = this._node._spacingY;
        if(nodeSpacingY === 0) nodeSpacingY = this._drawFontsize;
        else { nodeSpacingY = nodeSpacingY * this._drawFontsize / this._node._fontSize;}
        return nodeSpacingY | 0;
    };
    proto._fragmentText = function fragmentText(text, maxWidth, ctx) {
        var words = text.split(' '),
            lines = [],
            line = "";
        if (ctx.measureText(text).width < maxWidth) {
            return [text];
        }
        while (words.length > 0) {
            while (ctx.measureText(words[0]).width >= maxWidth) {
                var tmp = words[0];
                words[0] = tmp.slice(0, -1);
                if (words.length > 1) {
                    words[1] = tmp.slice(-1) + words[1];
                } else {
                    words.push(tmp.slice(-1));
                }
            }
            if (ctx.measureText(line + words[0]).width < maxWidth) {
                line += words.shift() + " ";
            } else {
                lines.push(line);
                line = "";
            }
            if (words.length === 0) {
                lines.push(line);
            }
        }
        return lines;
    };

    proto._bakeLabel = function() {
        var node = this._node;
        this._drawFontsize = node._fontSize;
        var ctx = this._labelContext;
        var canvasSizeX = node._contentSize.width;
        var canvasSizeY = node._contentSize.height;
        var paragraphedStrings = node._string.split("\n");
        var paragraphLength = [];
        this._drawFontsize = node._fontSize;
        var fontDesc = this._drawFontsize.toString() + "px ";
        var fontFamily = node._fontHandle.length === 0? "serif" : node._fontHandle;
        fontDesc = fontDesc + fontFamily;
        this._labelContext.font = fontDesc;
        for(var i = 0; i < paragraphedStrings.length; ++i) {
            var textMetric = ctx.measureText(paragraphedStrings[i]);
            paragraphLength.push(textMetric.width);
        }

        if(cc.Label.Overflow.CLAMP == node._overFlow) {
            if(node._isWrapText) {
                this._splitedStrings = [];
                for(var i = 0; i < paragraphedStrings.length; ++i) {
                    this._splitedStrings = this._splitedStrings.concat(this._fragmentText(paragraphedStrings[i], canvasSizeX, ctx));
                }
            }
            else {
                this._splitedStrings = paragraphedStrings;
            }
        }
        else if(cc.Label.Overflow.RESIZE == node._overFlow) {
            //todo fix it
            if(node._isWrapText) {
                this._splitedStrings = [];
                for(var i = 0; i < paragraphedStrings.length; ++i) {
                    this._splitedStrings = this._splitedStrings.concat(this._fragmentText(paragraphedStrings[i], canvasSizeX, ctx));
                }
                canvasSizeY = this._splitedStrings.length * this._getLineHeight();
                node.setContentSize(cc.size(canvasSizeX,canvasSizeY));
            }
            else {
                this._splitedStrings = paragraphedStrings;
                canvasSizeY = this._splitedStrings.length * this._getLineHeight();
                node.setContentSize(cc.size(canvasSizeX,canvasSizeY));
            }
        }
        else {
            this._splitedStrings = paragraphedStrings;
            //shrink
            if(node._isWrapText) {
                var totalLength = 0;
                for(var i = 0; i < paragraphedStrings.length; ++i) { totalLength += ((paragraphLength[i]/canvasSizeX + 1) | 0) * canvasSizeX; }
                var scale = canvasSizeX * ((canvasSizeY/this._getLineHeight())|0)/totalLength;
                this._drawFontsize = (this._drawFontsize * Math.min(Math.sqrt(scale),1) ) | 0;
                fontDesc = this._drawFontsize.toString() + "px " + fontFamily;
                this._labelContext.font = fontDesc;
                //
                this._splitedStrings = [];
                for(var i = 0; i < paragraphedStrings.length; ++i) {
                    this._splitedStrings = this._splitedStrings.concat(this._fragmentText(paragraphedStrings[i], canvasSizeX, ctx));
                }
            }
            else {
                var maxLength = 0;
                var totalHeight = paragraphedStrings.length * this._getLineHeight();
                for(var i = 0; i < paragraphedStrings.length; ++i) {
                    if(maxLength < paragraphLength[i]) maxLength = paragraphLength[i];
                }
                var scaleX = canvasSizeX/maxLength;
                var scaleY = canvasSizeY/totalHeight;

                this._drawFontsize = (this._drawFontsize * Math.min(1, scaleX, scaleY)) | 0;
                fontDesc = this._drawFontsize.toString() + "px " + fontFamily;
                this._splitedStrings = paragraphedStrings;
            }

        }

        this._labelCanvas.width = canvasSizeX;
        this._labelCanvas.height = canvasSizeY;
        this._labelContext.clearRect(0,0,this._labelCanvas.width,this._labelCanvas.height);
        //this._labelContext.fillStyle = "rgb(128,128,128)";
        //this._labelContext.fillRect(0,0,this._labelCanvas.width,this._labelCanvas.height);
        this._labelContext.fillStyle = "rgb(255,255,255)";

        var lineHeight = this._getLineHeight();
        var lineCount = this._splitedStrings.length;
        var labelX; var firstLinelabelY;
        var hAlign; var vAlign;
        //apply align
        {
            if(cc.Label.HorizontalAlign.RIGHT === node._hAlign) {
                hAlign = "right";
                labelX = canvasSizeX;
            }
            else if(cc.Label.HorizontalAlign.CENTER === node._hAlign) {
                hAlign = "center";
                labelX = canvasSizeX/2;
            }
            else {
                hAlign = "left";
                labelX = 0;
            }

            this._labelContext.textAlign = hAlign;
            if(cc.Label.VerticalAlign.TOP === node._vAlign) {
                vAlign = "top";
                firstLinelabelY = 0;
            }
            else if(cc.Label.VerticalAlign.CENTER === node._vAlign) {
                vAlign = "middle";
                firstLinelabelY = canvasSizeY/2 - lineHeight * (lineCount -1 ) / 2;
            }
            else {
                vAlign = "bottom";
                firstLinelabelY = canvasSizeY - lineHeight * (lineCount -1 );
            }
            this._labelContext.textBaseline = vAlign;
        }

        this._labelContext.font = fontDesc;

        //do real rendering
        for(var i = 0; i < this._splitedStrings.length; ++i) {
            this._labelContext.fillText(this._splitedStrings[i],labelX,firstLinelabelY + i * lineHeight);
        }

        this._labelTexture = new cc.Texture2D();
        this._labelTexture.initWithElement(this._labelCanvas);
        this._labelTexture.handleLoadedTexture();
    };

    proto._prepareQuad = function() {
        var quad = this._quad;
        var white = cc.color(255,255,255,255);
        var width = this._node._contentSize.width;
        var height = this._node._contentSize.height;
        quad._bl.colors = white;
        quad._br.colors = white;
        quad._tl.colors = white;
        quad._tr.colors = white;

        quad._bl.vertices = new cc.Vertex3F(0,0,0);
        quad._br.vertices = new cc.Vertex3F(width,0,0);
        quad._tl.vertices = new cc.Vertex3F(0,height,0);
        quad._tr.vertices = new cc.Vertex3F(width,height,0);

        //texture coordinate should be y-flipped
        quad._bl.texCoords = new cc.Tex2F(0,1);
        quad._br.texCoords = new cc.Tex2F(1,1);
        quad._tl.texCoords = new cc.Tex2F(0,0);
        quad._tr.texCoords = new cc.Tex2F(1,0);

        this._quadDirty = true;
    }

})();