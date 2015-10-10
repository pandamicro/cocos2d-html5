var _assetUrls = [
    getAssetsPath('12/123456/1.jpg'),
    getAssetsPath('91/91048d06-d998-4499-94c3-a5e0eccd40cf/1.fnt')
];

describe( 'test asset', function () {

    it( 'Fire.Texture.createNodeByUrl', function (done) {

        Fire.Texture.createNodeByUrl(_assetUrls[0], function (err, node) {
            if (err) throw err;

            assert( node );
            assert( node.texture );
            expect( node.texture.url ).equal( _assetUrls[0] );
            expect( node instanceof cc.Sprite );

            done();
        });

    });

    it( 'Fire.BitmapFont.createNodeByUrl', function (done) {
        Fire.BitmapFont.createNodeByUrl(_assetUrls[1], function (err, node) {
            if (err) throw err;

            expect( node._fntFile ).equal( _assetUrls[1] );

            done();
        });
    });
});
