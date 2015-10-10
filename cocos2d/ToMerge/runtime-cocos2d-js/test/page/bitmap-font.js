
var _text = 'test bitmap-font';

describe( 'test BitmapFont wrapper', function () {
    var node,
        wrapper,
        url = window.getAssetsPath('bitmap-font.fnt');

    beforeEach(function () {
        node = new cc.LabelBMFont();
        wrapper = cc(node);
    });

    it( 'BitmapFont wrapper exists', function () {
        assert( node );
        assert( wrapper );

        expect( wrapper.align ).equal( Runtime.TextAlign.Left );
        expect( wrapper.anchor ).equal( Runtime.TextAnchor.MiddleCenter );
    });

    it( 'anchor', function () {
        wrapper.anchor = Runtime.TextAnchor.TopRight;

        var anchorPoint = node.getAnchorPoint();

        expect( anchorPoint.x ).equal( 1 );
        expect( anchorPoint.y ).equal( 1 );
        expect( wrapper.anchor ).equal( Runtime.TextAnchor.TopRight );

        wrapper.anchor = Runtime.TextAnchor.BottomLeft;

        anchorPoint = node.getAnchorPoint();

        expect( anchorPoint.x ).equal( 0 );
        expect( anchorPoint.y ).equal( 0 );
        expect( wrapper.anchor ).equal( Runtime.TextAnchor.BottomLeft );

        wrapper.anchor = Runtime.TextAnchor.MiddleCenter;

        anchorPoint = node.getAnchorPoint();

        expect( anchorPoint.x ).equal( 0.5 );
        expect( anchorPoint.y ).equal( 0.5 );
        expect( wrapper.anchor ).equal( Runtime.TextAnchor.MiddleCenter );
    });

    it( 'align', function () {
        wrapper.align = Runtime.TextAlign.Left;

        expect( wrapper.align ).equal( Runtime.TextAlign.Left );
        expect( node._alignment ).equal( Runtime.TextAlign.Left );
    });

    it( 'text', function () {
        wrapper.text = 'tttt';

        expect( wrapper.text ).equal( 'tttt' );
        expect( node.string ).equal( 'tttt' );
    });

    it( 'change font', function () {

        wrapper.bitmapFont = url;

        expect( wrapper.bitmapFont ).equal( url );
        expect( node._fntFile ).equal( url );
    });

    it( 'simple serialize', function () {
        wrapper.onBeforeSerialize();

        expect( wrapper._text ).equal( '' );
        expect( wrapper._anchor ).equal( Runtime.TextAnchor.MiddleCenter );
        expect( wrapper._align ).equal( Runtime.TextAlign.Left );
        expect( wrapper._bitmapFont ).equal( '' );
    });

    it( 'serialize with property', function () {

        wrapper.text = _text;
        wrapper.anchor = Runtime.TextAnchor.BottomRight;
        wrapper.align = Runtime.TextAlign.Right;
        wrapper.bitmapFont = url;

        wrapper.onBeforeSerialize();

        expect( wrapper._text ).equal( _text );
        expect( wrapper._anchor ).equal( Runtime.TextAnchor.BottomRight );
        expect( wrapper._align ).equal( Runtime.TextAlign.Right );
        expect( wrapper.bitmapFont ).equal( url );
    });

    it( 'simple createNode', function() {

        var node = wrapper.createNode();

        assert( node instanceof cc.LabelBMFont );
        expect( node._fntFile ).equal( '' );
        expect( node.string ).equal( '' );
        expect( node.textAlign ).equal( Runtime.TextAlign.Left );
    });

    it( 'createNode with onBeforeSerialize called', function () {
        wrapper.text = _text;
        wrapper.anchor = Runtime.TextAnchor.BottomRight;
        wrapper.align = Runtime.TextAlign.Right;
        wrapper.bitmapFont = url;
        wrapper._bitmapFontToLoad = url;

        wrapper.onBeforeSerialize();

        var node = wrapper.createNode();

        assert( node instanceof cc.LabelBMFont );
        expect( node._fntFile ).equal( url );
        expect( node.string ).equal( _text );
        expect( node.textAlign ).equal( Runtime.TextAlign.Right );
    });
});
