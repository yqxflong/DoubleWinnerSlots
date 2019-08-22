/**
 * Created by JianWang on 7/21/16.
 */
/**
 * Created by JianWang on 7/18/16.
 */
var CustomDrawingNode = require("./CustomDrawingNode");
var AntialiasingLineNode  = CustomDrawingNode.extend({
    _lineWidth:1,
    _lineColor:new cc.Color(255,255,255,255),
    _pointOnLine:[],
    _distanceForPointOnLine:[],
    _overdraw:2,
    _uvRepeatInterval:0,
    ctor:function(pointsOnLine, lineWidth, lineColor, lineTexture,uvRepeatInterval) {

        this._lineWidth = lineWidth;
        this._lineColor = lineColor;

        if (lineTexture === undefined)
            this._texture = null;
        else if(cc.isString(lineTexture))
        {
            this._texture = cc.textureCache.addImage(lineTexture);
        }
        else if(typeof lineTexture === "object")
            this._texture = lineTexture;

        this._uvRepeatInterval = uvRepeatInterval || 0;

        if(this._uvRepeatInterval == 0 && this._texture)
            this._uvRepeatInterval = this._texture.getPixelsWide();

        this._pointOnLine = this.generateExtraVertices(pointsOnLine);
        if(this._pointOnLine.length)
             this._super(this._pointOnLine.length * 4, (this._pointOnLine.length - 1) * 18);
        else
            this._super(100,300);
        if(this._texture)
            this._shaderProgram = cc.shaderCache.getProgram(cc.SHADER_POSITION_TEXTURECOLOR);
        else
            this._shaderProgram = cc.shaderCache.getProgram(cc.SHADER_POSITION_COLOR);

        this._blendFunc = new cc.BlendFunc(cc.ONE, cc.ONE_MINUS_SRC_ALPHA);
    },
    setOverDraw:function (overdraw) {
        this._overdraw = overdraw;
    },
    updateRenderParameter:function( ) {

        if(this._texture) {
            gl.bindTexture(gl.TEXTURE_2D, this._texture.getName());

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
    },
    calculateDistancesForPointOnLine:function () {

        this._distanceForPointOnLine = [];

        this._distanceForPointOnLine.push(0);
        for(var i = 1; i < this._pointOnLine.length; i++)
        {
            var dis = cc.pDistance(this._pointOnLine[i],this._pointOnLine[i - 1]);
            this._distanceForPointOnLine.push(this._distanceForPointOnLine[i-1] + dis);
        }
    },
    updateRenderData:function()
    {
        this.calculateDistancesForPointOnLine();
        if(this._uvRepeatInterval == 0)
            this._uvRepeatInterval = this._distanceForPointOnLine[this._pointOnLine.length - 1];
        this.updateVertexBuffer();
        this.updateIndexBuffer();

        this._indexCountToDaw = (this._pointOnLine.length - 1) * 18;
    },
    updateVertexBuffer:function()
    {
        var _t = this;

        if(_t._pointOnLine.length < 2)
            return;

        var pointOnLineCount = _t._pointOnLine.length;

     //   var lineColorWithAlphaZero = new cc.Color(this._lineColor.r,this._lineColor.g,this._lineColor.b, 0);
        var lineColorWithAlphaZero = new cc.Color(0, 0, 0, 0);
        var dir = new cc.p(_t._pointOnLine[1].x - _t._pointOnLine[0].x,_t._pointOnLine[1].y - _t._pointOnLine[0].y);
        var perpendicular = cc.pNormalize(new cc.p(-dir.y, dir.x));

        var pa = new cc.p(_t._pointOnLine[0].x + perpendicular.x * (_t._lineWidth/2 + _t._overdraw), _t._pointOnLine[0].y + perpendicular.y * (_t._lineWidth/2 + _t._overdraw));
        var pb = new cc.p(_t._pointOnLine[0].x + perpendicular.x * _t._lineWidth/2, _t._pointOnLine[0].y + perpendicular.y * _t._lineWidth/2);

        var pc = new cc.p(_t._pointOnLine[0].x - perpendicular.x * _t._lineWidth/2, _t._pointOnLine[0].y - perpendicular.y * _t._lineWidth/2);
        var pd = new cc.p(_t._pointOnLine[0].x - perpendicular.x * (_t._lineWidth/2 + _t._overdraw), _t._pointOnLine[0].y - perpendicular.y * (_t._lineWidth/2 + _t._overdraw));

        _t.setVertexPosition(0, pa);
        _t.setVertexColor(0, lineColorWithAlphaZero);
        _t.setVertexUV(0, new cc.p(0, 1));

        _t.setVertexPosition(pointOnLineCount, pb);
        _t.setVertexColor(pointOnLineCount,this._lineColor);
        _t.setVertexUV(pointOnLineCount,new cc.p(0, 1));

        _t.setVertexPosition(pointOnLineCount * 2, pc);
        _t.setVertexColor(pointOnLineCount * 2,this._lineColor);
        _t.setVertexUV(pointOnLineCount * 2,new cc.p(0, 0));

        _t.setVertexPosition(pointOnLineCount * 3, pd);
        _t.setVertexColor(pointOnLineCount * 3, lineColorWithAlphaZero);
        _t.setVertexUV(pointOnLineCount * 3,new cc.p(0, 0));

        for(var i = 1; i < pointOnLineCount - 1; i++) {
            var dirPre = new cc.p(this._pointOnLine[i - 1].x - this._pointOnLine[i].x, this._pointOnLine[i - 1].y - this._pointOnLine[i].y);
            var dirNext = new cc.p(this._pointOnLine[i + 1].x - this._pointOnLine[i].x, this._pointOnLine[i + 1].y - this._pointOnLine[i].y);

            var perpendicularPre = cc.pNormalize(cc.p(dirPre.y, -dirPre.x));
            //  var perpendicularNext = cc.pNormalize(new cc.p(-dirNext.y, dirNext.x));
            // var scaleDir = cc.p((perpendicularPre.x + perpendicularNext.x)/2,(perpendicularPre.y + perpendicularNext.y)/2);

            var pToPre = cc.pNormalize(dirPre);
            var pToNext = cc.pNormalize(dirNext);
            var preAddNext = cc.pNormalize(cc.p((pToPre.x + pToNext.x), (pToPre.y + pToNext.y)));

            var cos = perpendicularPre.x * preAddNext.x + perpendicularPre.y * preAddNext.y;

            var scaleDir = perpendicularPre;

            if (Math.abs(cos) > 0.0001)
            {
                scaleDir.x = preAddNext.x * 1/ cos;
                scaleDir.y = preAddNext.y * 1/ cos;
            }

            var pa = new cc.p(this._pointOnLine[i].x + scaleDir.x * (_t._lineWidth/2 + _t._overdraw), this._pointOnLine[i].y + scaleDir.y * (_t._lineWidth/2 + _t._overdraw));
            var pb = new cc.p(this._pointOnLine[i].x + scaleDir.x * this._lineWidth/2, this._pointOnLine[i].y + scaleDir.y * this._lineWidth/2);
            var pc = new cc.p(this._pointOnLine[i].x - scaleDir.x * this._lineWidth/2, this._pointOnLine[i].y - scaleDir.y * this._lineWidth/2);
            var pd = new cc.p(this._pointOnLine[i].x - scaleDir.x * (_t._lineWidth/2 + _t._overdraw), this._pointOnLine[i].y - scaleDir.y * (_t._lineWidth/2 + _t._overdraw));

            var uv_u = _t.calculateUVForPointOnLine(i);
            this.setVertexPosition(i, pa);
            this.setVertexColor(i,lineColorWithAlphaZero);
            this.setVertexUV(i,new cc.p(uv_u, 1));

            this.setVertexPosition(pointOnLineCount + i, pb);
            this.setVertexColor(pointOnLineCount  + i,_t._lineColor);
            this.setVertexUV(pointOnLineCount + i,new cc.p(uv_u, 1));

            this.setVertexPosition(pointOnLineCount * 2 + i, pc);
            this.setVertexColor(pointOnLineCount * 2 + i,_t._lineColor);
            this.setVertexUV(pointOnLineCount * 2 + i,new cc.p(uv_u, 0));

            this.setVertexPosition(pointOnLineCount * 3 + i, pd);
            this.setVertexColor(pointOnLineCount * 3  + i,lineColorWithAlphaZero);
            this.setVertexUV(pointOnLineCount * 3  + i, new cc.p(uv_u, 0));
        }

        dir = new cc.p(this._pointOnLine[pointOnLineCount - 1].x - this._pointOnLine[pointOnLineCount - 2].x,this._pointOnLine[pointOnLineCount - 1].y - this._pointOnLine[pointOnLineCount - 2].y);
        perpendicular = cc.pNormalize(new cc.p(-dir.y, dir.x));

        pa = new cc.p(this._pointOnLine[pointOnLineCount - 1].x + perpendicular.x * (_t._lineWidth/2 + _t._overdraw), this._pointOnLine[pointOnLineCount - 1].y + perpendicular.y * (_t._lineWidth/2 + _t._overdraw));
        pb = new cc.p(this._pointOnLine[pointOnLineCount - 1].x + perpendicular.x * this._lineWidth/2, this._pointOnLine[pointOnLineCount - 1].y + perpendicular.y * this._lineWidth/2);
        pc = new cc.p(this._pointOnLine[pointOnLineCount - 1].x - perpendicular.x * this._lineWidth/2, this._pointOnLine[pointOnLineCount - 1].y - perpendicular.y * this._lineWidth/2);
        pd = new cc.p(this._pointOnLine[pointOnLineCount - 1].x - perpendicular.x * (_t._lineWidth/2 + _t._overdraw), this._pointOnLine[pointOnLineCount - 1].y - perpendicular.y * (_t._lineWidth/2 + _t._overdraw));

        var uv_u = _t.calculateUVForPointOnLine(pointOnLineCount - 1);

        this.setVertexPosition(pointOnLineCount - 1, pa);
        this.setVertexColor(pointOnLineCount - 1,lineColorWithAlphaZero);
        this.setVertexUV(pointOnLineCount - 1,new cc.p(uv_u, 1));

        this.setVertexPosition(2* pointOnLineCount - 1, pb);
        this.setVertexColor(2 * pointOnLineCount - 1,this._lineColor);
        this.setVertexUV(2 * pointOnLineCount - 1,new cc.p(uv_u, 1));

        this.setVertexPosition(3 * pointOnLineCount - 1, pc);
        this.setVertexColor(3 * pointOnLineCount - 1,this._lineColor);
        this.setVertexUV(3 * pointOnLineCount - 1, new cc.p(uv_u, 0));

        this.setVertexPosition(4 * pointOnLineCount - 1, pd);
        this.setVertexColor(4 * pointOnLineCount - 1,lineColorWithAlphaZero);

        this.setVertexUV(4 * pointOnLineCount - 1, new cc.p(uv_u, 0));
    },

    updateIndexBuffer:function()
    {
        var pointOnLineCount = this._pointOnLine.length;

        for(var i = 0; i < pointOnLineCount - 1; i++)
        {
            this._indexbufferData[i * 18] = i;
            this._indexbufferData[i * 18 + 1] = i + pointOnLineCount;
            this._indexbufferData[i * 18 + 2] = i + 1;

            this._indexbufferData[i * 18 + 3] = i + pointOnLineCount;
            this._indexbufferData[i * 18 + 4] = i + 1 + pointOnLineCount;
            this._indexbufferData[i * 18 + 5] = i + 1;

            this._indexbufferData[i * 18 + 6] = i + pointOnLineCount;
            this._indexbufferData[i * 18 + 7] = i + pointOnLineCount * 2;
            this._indexbufferData[i * 18 + 8] = i + pointOnLineCount + 1;

            this._indexbufferData[i * 18 + 9] = i + pointOnLineCount * 2;
            this._indexbufferData[i * 18 + 10] = i + 1 + pointOnLineCount * 2;
            this._indexbufferData[i * 18 + 11] = i + pointOnLineCount + 1;

            this._indexbufferData[i * 18 + 12] = i + pointOnLineCount * 2;
            this._indexbufferData[i * 18 + 13] = i + pointOnLineCount * 3;
            this._indexbufferData[i * 18 + 14] = i + pointOnLineCount * 2 + 1;

            this._indexbufferData[i * 18 + 15] = i + pointOnLineCount * 3;
            this._indexbufferData[i * 18 + 16] = i + pointOnLineCount * 3 + 1;
            this._indexbufferData[i * 18 + 17] = i + pointOnLineCount * 2 + 1;

        }
    },
    calculateUVForPointOnLine:function (index) {
        return this._distanceForPointOnLine[index] / this._uvRepeatInterval;
    },
    generateExtraVertices:function (pointOnLine) {
        return pointOnLine;
    }
});

module.exports = AntialiasingLineNode;