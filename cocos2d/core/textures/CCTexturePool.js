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

function hierarchyWalker (node, handler) {
    handler(node);

    var children = node.children;
    for (var i = 0; i < children.length; ++i) {
        hierarchyWalker(children[i], handler);
    }

    if (node._protectedChildren) {
        children = node._protectedChildren;
        for (i = 0; i < children.length; ++i) {
            hierarchyWalker(children[i], handler);
        }
    }
}

cc.texturePool = (function () {

    var pool = [];

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
            var tex = cc.textureCache.getTextureForKey(texKey);
            tex.retain();
        },

        /**
         * 不再保留一个贴图，让 cc.texturePool 正常管理这个贴图
         */
        unkeepTexture: function (node) {
            var tex = cc.textureCache.getTextureForKey(texKey);
            tex.release();
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


    // Release handlers for all texture related Node types
    function generateReleaseHandler (key) {
        return function (node) {
            node[key] = null;
        };
    }

    var releaseHandlers = [
        {
            type: cc.Scale9Sprite,
            handle: function (node) {
                for (i = 0; i < subSprites.length; ++i) {
                    prop = subSprites[i];
                    if (this[prop] && this[prop]._texture) {
                        this[prop]._texture = null;
                    }
                }
            }
        },
        {
            type: cc.Sprite,
            handle: generateReleaseHandler('_texture')
        },
        {
            type: cc.ParticleSystem,
            handle: generateReleaseHandler('_texture')
        },
        {
            type: cc.ParticleBatchNode,
            handle: generateReleaseHandler('textureAtlas')
        },
        {
            type: cc.RenderTexture,
            handle: generateReleaseHandler('_texture')
        },
        {
            type: cc.SpriteBatchNode,
            handle: function (node) {
                var key = '_texture';
                if (node._renderCmd instanceof cc.SpriteBatchNode.WebGLRenderCmd) {
                    key = '_textureAtlas';
                }
                node._renderCmd[key] = null;
            }
        },
        {
            type: cc.MotionStreak,
            handle: generateReleaseHandler('texture')
        },
        {
            type: cc.AtlasNode,
            handle: generateReleaseHandler('_texture')
        },
        {
            type: cc.GridBase,
            handle: generateReleaseHandler('_texture')
        }
    ];

    // Polyfill Node
    var nodeCtor = cc.Node.prototype.ctor;
    var nodeAddChild = cc.Node.prototype.addChild;
    var nodeRemoveChild = cc.Node.prototype.removeChild;
    var nodeAddProtectedChild = cc.ProtectedNode.prototype.addProtectedChild;
    var nodeRemoveProtectedChild = cc.ProtectedNode.prototype.removeProtectedChild;
    cc.inject({
        ctor: function () {
            nodeCtor.call(this);
            this._resRefCount = 1;
        },
        
        retainJS: function () {
            this._resRefCount++;
        },

        releaseJS: function () {
            if (this._resRefCount > 0) {
                this._resRefCount--;

                if (this._resRefCount === 0) {
                    // Release all textures
                    this.releaseRes();

                    // Release children
                    var children = this.children;
                    for (var i = 0; i < children.length; ++i) {
                        children[i].releaseJS();
                    }
                    if (this._protectedChildren) {
                        children = this._protectedChildren;
                        for (i = 0; i < children.length; ++i) {
                            children[i].releaseJS();
                        }
                    }
                }
                // Auto release, if node's ref count have incremented at least once and released to become 1, 
                // then no other node is referencing it, so we can release it
                // If a node is created, but never added to other node, it will not automatically be released,
                // user need to invoke releaseJS manually.
                else if (this._resRefCount === 1) {
                    this.releaseJS();
                }
                else if (this._resRefCount < 0) {
                    cc.log("Node resources already cleaned up");
                }
            }
        },

        releaseRes: function () {
            for (var i = 0; i < releaseHandlers.length; ++i) {
                var handler = releaseHandlers[i];
                if (this instanceof handler.type) {
                    handler.handle(this);
                    return;
                }
            }
        },

        addChild: function (child, localZOrder, tag) {
            nodeAddChild.call(this, child, localZOrder, tag);
            child.retainJS();
        },

        removeChild: function (child, cleanup) {
            nodeRemoveChild.call(this, child, cleanup);
            child.releaseJS();
        },

        addProtectedChild: function(child, localZOrder, tag) {
            nodeAddProtectedChild.call(this, child, localZOrder, tag);
            child.retainJS();
        },

        removeProtectedChild: function(child,  cleanup) {
            nodeRemoveProtectedChild.call(this, child, cleanup);
            child.releaseJS();
        }
    }, cc.Node.prototype);


    // Polyfill Texture properties getter setter
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

    var i, proto, prop;

    for (prop in polyfillMap) {
        var protos = polyfillMap[prop];
        for (i = 0; i < protos.length; ++i) {
            proto = protos[i];
            if (!proto) continue;

            cc.defineGetterSetter(proto, prop, textureGetter, textureSetter);
        }
    }


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


    // Polyfill director
    var dirPushScene = cc.director.pushScene;
    var dirPopScene = cc.director.popScene;
    var dirRunScene = cc.director.runScene;
    cc.inject({
        pushScene: function (scene) {
            dirPushScene.call(this, scene);
            scene.retainJS();
        },
        runScene: function (scene) {
            var runningScene = this.getRunningScene();
            dirRunScene.call(this, scene);
            if (runningScene) {
                runningScene.releaseJS();
                scene.retainJS();
            }
        },
        popScene: function () {
            var runningScene = this.getRunningScene();
            dirPopScene.call(this);
            if (runningScene) {
                runningScene.releaseJS();
            }
        }
    }, cc.director);


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
        
        var generateFreeup = function (bufferProps) {
            return function () {
                for (var i = 0; i < bufferProps.length; ++i) {
                    var prop = bufferProps[i];
                    var buffer = this._renderCmd[prop];
                    cc._renderContext.deleteBuffer(buffer);
                    this._renderCmd[prop] = null;
                }
            };
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
                proto: cc.ParticleSystem ? cc.ParticleSystem.prototype : null,
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
            if (!polyfill.proto) continue;
            
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