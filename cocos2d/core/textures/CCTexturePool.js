/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.

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

cc.texturePool = (function () {

    function generateHandler (key) {
        return function (node, keep) {
            var tex = node[key];
            if (tex) {
                var texKey = cc.textureCache.getKeyByTexture(tex);
                if (keep) {
                    cc.texturePool.keepTexture(texKey);
                }
                else {
                    cc.texturePool.unkeepTexture(texKey);
                }
            }
        };
    }

    var keepHandlers = [
        {
            type: cc.Scale9Sprite,
            handle: function (node, keep) {
                var tex = node._scale9Image._texture;
                if (tex) {
                    var texKey = cc.textureCache.getKeyByTexture(tex);
                    if (keep) {
                        cc.texturePool.keepTexture(texKey);
                    }
                    else {
                        cc.texturePool.unkeepTexture(texKey);
                    }
                }
            }
        },
        {
            type: cc.Sprite,
            handle: generateHandler('_texture')
        },
        {
            type: cc.ParticleSystem,
            handle: generateHandler('_texture')
        },
        {
            type: cc.ParticleBatchNode,
            handle: generateHandler('textureAtlas')
        },
        {
            type: cc.RenderTexture,
            handle: generateHandler('_texture')
        },
        {
            type: cc.SpriteBatchNode,
            handle: function (node, keep) {
                var key = '_texture';
                if (node._renderCmd instanceof cc.SpriteBatchNode.WebGLRenderCmd) {
                    key = '_textureAtlas';
                }
                var tex = node._renderCmd[key];
                if (tex) {
                    var texKey = cc.textureCache.getKeyByTexture(tex);
                    if (keep) {
                        cc.texturePool.keepTexture(texKey);
                    }
                    else {
                        cc.texturePool.unkeepTexture(texKey);
                    }
                }
            }
        },
        {
            type: cc.MotionStreak,
            handle: generateHandler('texture')
        },
        {
            type: cc.AtlasNode,
            handle: generateHandler('_texture')
        },
        {
            type: cc.GridBase,
            handle: generateHandler('_texture')
        }
    ];

    function hierarchyWalker (node, handler) {
        handler(node);

        var children = node.children;
        for (var i = 0; i < children.length; ++i) {
            hierarchyWalker(children[i], handler);
        }
    }

    var pool = [];
    var kept = {};

    return {

        /**
         * 获取所有被 cc.texturePool 管理的贴图 url
         */
        getPool: function () {
            return pool;
        },

        /**
         * 通过 url 添加一个贴图到 cc.texturePool 中
         */
        add: function (texKey) {
            if (pool.indexOf(texKey) === -1) {
                pool.push(texKey);
            }
        },

        /**
         * 通过 url 从 cc.texturePool 中删除一个贴图
         */
        remove: function (texKey) {
            var index = pool.indexOf(texKey);
            if (index >= 0) {
                pool.splice(index, 1);
            }
        },

        /**
         * 通过 url 指定一个贴图资源不被删除
         */
        keepTexture: function (texKey) {
            if (!kept[texKey]) {
                kept[texKey] = true;
            }
        },

        /**
         * 不再保留一个贴图，让 cc.texturePool 正常管理这个贴图
         */
        unkeepTexture: function (node) {
            if (kept[texKey]) {
                delete kept[texKey];
            }
        },

        /**
         * 保留一个节点下依赖的所有贴图资源不被删除
         */
        keepTexturesForNode: function (root) {
            hierarchyWalker(root, function (node) {
                for (var i = 0; i < keepHandlers.length; ++i) {
                    var handler = keepHandlers[i];
                    if (node instanceof handler.type) {
                        handler.handle(node, true);
                        return;
                    }
                }
            });
        },

        /**
         * 不再保留一个节点所依赖的所有贴图，让 cc.texturePool 正常管理它们
         */
        unkeepTexturesForNode: function (root) {
            hierarchyWalker(root, function (node) {
                for (var i = 0; i < keepHandlers.length; ++i) {
                    var handler = keepHandlers[i];
                    if (node instanceof handler.type) {
                        handler.handle(node, false);
                        return;
                    }
                }
            });
        },

        /**
         * 释放指定的贴图资源
         */
        releaseTexture: function (tex, texKey, index) {
            if (texKey === undefined) {
                texKey = cc.textureCache.getKeyByTexture(tex);
            }
            if (index === undefined) {
                index = pool.indexOf(texKey);
            }

            // Release it
            if (tex._refCount === 0) {
                delete cc.textureCache._textures[texKey];
                cc.spriteFrameCache.removeSpriteFramesFromTexture(tex);
                tex.releaseTexture();
                tex = null;
                if (index >= 0) {
                    pool.splice(index, 1);
                }
            }
        },

        /**
         * 释放所有被使用过但已经不再需要的贴图资源
         */
        releaseUnneeded: function () {
            var i, texKey;
            for (i = pool.length-1; i >= 0; --i) {
                texKey = pool[i];
                if (kept[texKey]) continue;

                var tex = cc.textureCache.getTextureForKey(texKey);
                // Don't release never used resources
                if (tex._neverUsed) continue;

                this.releaseTexture(tex, texKey, i);
            }
        },

        /**
         * 释放所有未被使用过的贴图资源
         */
        releaseUnused: function () {
            var i, texKey;
            for (i = pool.length-1; i >= 0; --i) {
                texKey = pool[i];
                if (kept[texKey]) continue;

                var tex = cc.textureCache.getTextureForKey(texKey);
                // Don't release used resources
                if (!tex._neverUsed) continue;

                this.releaseTexture(tex, texKey, i);
            }
        },

        /**
         * 打印当前被管理的资源列表（包含他们的资源索引数量）
         */
        dumpTextureCount: function () {
            var i, texKey, tex;
            cc.log('Total textures in pool: ' + pool.length);
            for (i = 0; i < pool.length; ++i) {
                texKey = pool[i];
                tex = cc.textureCache._textures[texKey];
                if (tex) {
                    cc.log('    - ' + texKey + ': ' + tex._refCount);
                }
            }
        }

    };
})();

cc.texturePool.init = function () {

    var texturePool = cc.texturePool;

    var defaultSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

    // Polyfill Texture2D
    var texture2DCtor = cc.Texture2D.prototype.ctor;
    cc.Texture2D.prototype.ctor = function () {
        texture2DCtor.call(this);
        this._refCount = 0;
        this._neverUsed = true;
        // texturePool.add(this);
    };

    cc.Texture2D.prototype.releaseTexture = function () {
        if (this._htmlElementObj) {
            this._htmlElementObj.src = defaultSrc;
            this._htmlElementObj = null;
        }
        if (this._webTextureObj && cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
            cc._renderContext.deleteTexture(this._webTextureObj);
        }
        var url = cc.path.join(cc.loader.resPath, this.url);
        cc.loader.release(url);
    };

    cc.Texture2D.prototype.retain = function () {
        this._refCount++;
        if (this._neverUsed) {
            this._neverUsed = false;
        }
    };

    cc.Texture2D.prototype.release = function () {
        if (this._refCount > 0) {
            this._refCount--;
        }
    };


    // Polyfill TextureAtlas
    cc.TextureAtlas.prototype.retain = function () {
        this.texture && this.texture.retain();
    };

    cc.TextureAtlas.prototype.release = function () {
        this.texture && this.texture.release();
    };


    // Polyfill Nodes
    function textureGetter () {
        return this.__texture;
    }
    function textureSetter (tex) {
        if (this.__texture) {
            this.__texture.release();
        }

        this.__texture = tex;
        tex && tex.retain();
    }

    function onExit() {
        this.__texture && this.__texture.release();
        this._onExit();
    }

    function overrideOnExit (proto) {
        proto._onExit = proto.onExit;
        proto.onExit = onExit;
    }

    var polyfillMap = {
        '_texture': [
            cc.Sprite.prototype,
            cc.AtlasNode.prototype,
            cc.SpriteBatchNode.CanvasRenderCmd.prototype,
            cc.GridBase ? cc.GridBase.prototype : null,
            cc.ParticleSystem ? cc.ParticleSystem.prototype : null,
            cc.RenderTexture ? cc.RenderTexture.prototype : null
        ],
        '_textureAtlas': [
            cc.SpriteBatchNode.WebGLRenderCmd.prototype
        ],
        'texture': [
            cc.MotionStreak ? cc.MotionStreak.prototype : null
        ],
        'textureAtlas': [
            cc.ParticleBatchNode ? cc.ParticleBatchNode.prototype : null
        ]
    };

    var i, proto, prop;

    for (prop in polyfillMap) {
        var protos = polyfillMap[prop];
        for (i = 0; i < protos.length; ++i) {
            proto = protos[i];
            if (!proto) continue;

            cc.defineGetterSetter(proto, prop, textureGetter, textureSetter);
            overrideOnExit(proto);
        }
    }

    // Polyfill Scale9Sprite
    var subSprites = [
        '_centre',
        '_top',
        '_bottom',
        '_left',
        '_right',
        '_topLeft',
        '_topRight',
        '_bottomLeft',
        '_bottomRight',
        '_scale9Image'
    ];

    proto = ccui.Scale9Sprite.prototype;
    function getSubSpriteGetter (prop) {
        var hiddenProp = '_' + prop;
        return function () {
            return this[hiddenProp];
        };
    }
    function getSubSpriteSetter (prop) {
        var hiddenProp = '_' + prop;
        return function (sprite) {
            if (this[hiddenProp]) {
                this[hiddenProp].onExit();
            }
            this[hiddenProp] = sprite;
        };
    }

    for (i = 0; i < subSprites.length; ++i) {
        prop = subSprites[i];
        cc.defineGetterSetter(proto, prop, getSubSpriteGetter(prop), getSubSpriteSetter(prop));
    }

    ccui.Scale9Sprite.prototype.onExit = function () {
        for (i = 0; i < subSprites.length; ++i) {
            prop = subSprites[i];
            if (this[prop]) {
                this[prop].onExit();
            }
        }
        cc.Node.prototype.onExit.call(this);
    };

    // Polyfill textureCache
    cc.inject({
        _cacheImage: cc.textureCache.cacheImage,
        cacheImage: function (path, texture) {
            this._cacheImage(path, texture);
            if (this._textures[path]) {
                cc.texturePool.add(path);
            }
        },

        _addUIImage: cc.textureCache.addUIImage,
        addUIImage: function (image, key) {
            var result = this._addUIImage(image, key);
            if (this._textures[key]) {
                cc.texturePool.add(key);
            }
            return result;
        },

        _addImage: cc.textureCache.addImage,
        addImage: function (url, cb, target) {
            var result = this._addImage(url, cb, target);
            if (this._textures[url]) {
                cc.texturePool.add(url);
            }
            return result;
        },

        _handleLoadedTexture: cc.textureCache.handleLoadedTexture,
        handleLoadedTexture: function (url) {
            this._handleLoadedTexture(url);
            if (this._textures[url]) {
                cc.texturePool.add(url);
            }
        }
    }, cc.textureCache);

    // release webgl buffer
    if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
        var generateOnEnter = function (bufferProps) {
            return function () {
                this._noBufferOnEnter();
                for (var i = 0; i < bufferProps.length; ++i) {
                    var prop = bufferProps[i];
                    var buffer = this._renderCmd[prop];
                    if (!buffer) {
                        this._renderCmd[prop] = cc._renderContext.createBuffer();
                    }
                }
            };
        };

        var polyfillOnEnter = function (proto, onEnter) {
            proto._noBufferOnEnter = proto.onEnter;
            proto.onEnter = onEnter;
        };
        
        var generateOnExit = function (bufferProps) {
            return function () {
                for (var i = 0; i < bufferProps.length; ++i) {
                    var prop = bufferProps[i];
                    var buffer = this._renderCmd[prop];
                    cc._renderContext.deleteBuffer(buffer);
                    this._renderCmd[prop] = null;
                }
                this._noBufferOnExit();
            };
        };

        var polyfillOnExit = function (proto, onExit) {
            proto._noBufferOnExit = proto.onExit;
            proto.onExit = onExit;
        };

        var bufferPolyfills = [
            {
                proto: cc.LayerColor.prototype,
                props: ['_verticesFloat32Buffer', '_colorsUint8Buffer']
            },
            {
                proto: cc.Sprite.prototype,
                props: ['_quadWebBuffer']
            },
            {
                proto: cc.ParticleSystem.prototype,
                onEnter: function () {
                    this._noBufferOnEnter();
                    var vbos = this._renderCmd._buffersVBO;
                    if (!vbos[0]) {
                        vbos[0] = cc._renderContext.createBuffer();
                    }
                    if (!vbos[1]) {
                        vbos[1] = cc._renderContext.createBuffer();
                    }
                },
                onExit: function () {
                    var vbos = this._renderCmd._buffersVBO;
                    if (vbos[0]) {
                        cc._renderContext.deleteBuffer(vbos[0]);
                    }
                    if (vbos[1]) {
                        cc._renderContext.deleteBuffer(vbos[1]);
                    }
                    this._noBufferOnExit();
                }
            }
        ];

        for (i = 0; i < bufferPolyfills; ++i) {
            var polyfill = bufferPolyfills[i];
            if (polyfill.props) {
                polyfillOnEnter(polyfill.proto, generateOnEnter(polyfill.props));
                polyfillOnExit(polyfill.proto, generateOnExit(polyfill.props));
            }
            else if (polyfill.onEnter && polyfill.onExit) {
                polyfillOnEnter(polyfill.proto, polyfill.onEnter);
                polyfillOnExit(polyfill.proto, polyfill.onExit);
            }
        }

        cc.ParticleSystem.WebGLRenderCmd.prototype._setupVBO = function() {
            var gl = cc._renderContext;

            if (this._buffersVBO[0]) {
                gl.deleteBuffer(this._buffersVBO[0]);
            }
            if (this._buffersVBO[1]) {
                gl.deleteBuffer(this._buffersVBO[1]);
            }

            this._buffersVBO[0] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._buffersVBO[0]);
            gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW);

            this._buffersVBO[1] = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);
        };
    }

};

cc.texturePool.init();