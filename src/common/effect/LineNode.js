/**
 * Created by JianWang on 7/18/16.
 */
var CustomDrawingNode = require("./CustomDrawingNode");
var LineNode  = CustomDrawingNode.extend({
    _lineWidth:1,
    _lineColor:new cc.Color(255,255,255,255),
    _lineTexture:null,
    _pointOnLine:[],
    
    ctor:function(pointsOnLine, lineWidth, lineColor, lineTexture) {

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

        this._pointOnLine = this.generateExtraVertices(pointsOnLine);

        if(this._pointOnLine.length)
            this._super(this._pointOnLine.length * 2, (this._pointOnLine.length - 1) * 6);
        else
            this._super(100);

        if(this._texture)
            this._shaderProgram = cc.shaderCache.getProgram(cc.SHADER_POSITION_TEXTURECOLOR);
        else
            this._shaderProgram = cc.shaderCache.getProgram(cc.SHADER_POSITION_COLOR);
    },
    updateRenderData:function()
    {
        this.updateVertexBuffer();
        this.updateIndexBuffer();

        this._indexCountToDaw = (this._pointOnLine.length - 1) * 6;
    },
    updateVertexBuffer:function()
    {
        var pointOnLineCount = this._pointOnLine.length;

        var dir = new cc.p(this._pointOnLine[1].x - this._pointOnLine[0].x,this._pointOnLine[1].y - this._pointOnLine[0].y);
        var perpendicular = cc.pNormalize(new cc.p(-dir.y, dir.x));

        var pa = new cc.p(this._pointOnLine[0].x + perpendicular.x * this._lineWidth/2, this._pointOnLine[0].y + perpendicular.y * this._lineWidth/2);
        var pb = new cc.p(this._pointOnLine[0].x - perpendicular.x * this._lineWidth/2, this._pointOnLine[0].y - perpendicular.y * this._lineWidth/2);

        this.setVertexPosition(0, pa);
        this.setVertexColor(0, this._lineColor);
        this.setVertexUV(0, new cc.p(0, 1));

        this.setVertexPosition(pointOnLineCount, pb);
        this.setVertexColor(pointOnLineCount,this._lineColor);
        this.setVertexUV(pointOnLineCount,new cc.p(0, 0));

        if(pointOnLineCount < 2)
            return;

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

            var pa = new cc.p(this._pointOnLine[i].x + scaleDir.x * this._lineWidth/2, this._pointOnLine[i].y + scaleDir.y * this._lineWidth/2);
            var pb = new cc.p(this._pointOnLine[i].x - scaleDir.x * this._lineWidth/2, this._pointOnLine[i].y - scaleDir.y * this._lineWidth/2);

            this.setVertexPosition(i, pa);
            this.setVertexColor(i,this._lineColor);
            this.setVertexUV(i,new cc.p(i / this._pointOnLine.length, 1));

            this.setVertexPosition(pointOnLineCount + i, pb);
            this.setVertexColor(pointOnLineCount + i,this._lineColor);
            this.setVertexUV(pointOnLineCount + i, new cc.p(i / this._pointOnLine.length, 0));
         }

        dir = new cc.p(this._pointOnLine[pointOnLineCount - 1].x - this._pointOnLine[pointOnLineCount - 2].x,this._pointOnLine[pointOnLineCount - 1].y - this._pointOnLine[pointOnLineCount - 2].y);
        perpendicular = cc.pNormalize(new cc.p(-dir.y, dir.x));

        pa = new cc.p(this._pointOnLine[pointOnLineCount - 1].x + perpendicular.x * this._lineWidth/2, this._pointOnLine[pointOnLineCount - 1].y + perpendicular.y * this._lineWidth/2);
        pb = new cc.p(this._pointOnLine[pointOnLineCount - 1].x - perpendicular.x * this._lineWidth/2, this._pointOnLine[pointOnLineCount - 1].y - perpendicular.y * this._lineWidth/2);

        this.setVertexPosition(pointOnLineCount - 1, pa);
        this.setVertexColor(pointOnLineCount - 1,this._lineColor);
        this.setVertexUV(pointOnLineCount - 1,new cc.p(1, 1));

        this.setVertexPosition(2 * pointOnLineCount - 1, pb);
        this.setVertexColor(2 * pointOnLineCount - 1,this._lineColor);
        this.setVertexUV(2 * pointOnLineCount - 1, new cc.p(1, 0));
    },

    updateIndexBuffer:function()
    {
        var pointOnLineCount = this._pointOnLine.length;

        for(var i = 0; i < pointOnLineCount - 1; i++)
        {
            this._indexbufferData[i * 6] = i;
            this._indexbufferData[i * 6+ 1] = i + pointOnLineCount;
            this._indexbufferData[i * 6 + 2] = i + 1;

            this._indexbufferData[i * 6 + 3] = i + pointOnLineCount;
            this._indexbufferData[i * 6 + 4] = i + 1 + pointOnLineCount;
            this._indexbufferData[i * 6 + 5] = i + 1;
        }
     },
    generateExtraVertices:function (pointOnLine) {
         return pointOnLine;
    }
});

module.exports = LineNode;