/**
 * Created by ZhonglinGuo on 16/6/15.
 */

var Util = require("../util/Util");
var CMesh = require("./CMesh");
var CMeshRenderNode = require("./CMeshRenderNode");

var LineDrawNode = cc.Node.extend({
    ctor: function () {
        cc.Node.prototype.ctor.call(this);

        this._color = new cc.Color(255, 255, 255, 255);

        this.drawNode = null;
        this.meshRender = null;

        if(cc.sys.isNative || cc._renderType === cc._RENDER_TYPE_CANVAS){
            this.drawNode = new cc.DrawNode();
            this.addChild(this.drawNode);
        }
    },

    setLineWidth: function (lineWidth) {
        this._lineWidth = lineWidth;
    },

    setColor: function (color) {
        this._color = color;
    },

    setPath: function (path) {
        if (this.drawNode){
            this.setPathWithDrawNode(path);
        }
        else {
            this.setPathWithMeshRender(path);
        }
    },

    setPathWithDrawNode: function (path) {
        for (var i=1; i<path.length; ++i) {
            this.drawNode.drawSegment(path[i-1], path[i], this._lineWidth, this._color);
        }
    },

    setPathWithMeshRender: function (path) {

        if (this.meshRender){
            this.meshRender.removeFromParent();
            this.meshRender = null;
        }

        var filename = "common/particle/winline.png";
        var tex = cc.textureCache.getTextureForKey(filename);
        tex.setTexParameters(cc.LINEAR, cc.LINEAR, cc.REPEAT, cc.REPEAT);
        if (tex){
            this.meshRender = new CMeshRenderNode();
            this.meshRender.setTexture(tex);
            this.mesh = this.createMesh(path, this._lineWidth);
            this.meshRender.setMesh(this.mesh);

            this.addChild(this.meshRender);
        }
    },

    calcLineLinkCornerLeft: function (src, mid, dst, halfWidth) {
        var vecIn = cc.pNormalize(cc.pSub(mid, src));
        var vecInLeft = cc.p(vecIn.y, -vecIn.x);

        var vecOut = cc.pNormalize(cc.pSub(dst, mid));
        var vecOutLeft = cc.p(vecOut.y, -vecOut.x);

        var leftNormal = cc.pNormalize(cc.pAdd(vecInLeft, vecOutLeft));
        var cosLeft = Math.abs(cc.pDot(leftNormal, vecInLeft));
        var leftWidth = halfWidth / cosLeft;

        var left = cc.pAdd(mid, cc.pMult(leftNormal, leftWidth));
        return left;
    },

    calcLineLeftNormal: function (src, dst, halfWidth) {
        var vecIn = cc.pNormalize(cc.pSub(dst, src));
        var vecInLeft = cc.pMult(cc.p(vecIn.y, -vecIn.x), halfWidth);
        return vecInLeft;
    },

    createMesh: function (path /*cc.p Array*/, halfWidth) {

        var u = 0;
        var vertices = [];
        var colors = [];
        var uvs = [];
        var indice = [];

        // first seg
        var firstLeft = cc.pAdd(path[0], this.calcLineLeftNormal(path[0], path[1], halfWidth));
        var firstRight = cc.pSub(cc.pMult(path[0], 2), firstLeft);
        vertices.push(firstLeft.x, firstLeft.y);
        vertices.push(firstRight.x, firstRight.y);
        uvs.push(u, 0);
        uvs.push(u, 1);

        colors.push(this._color.r/255, this._color.g/255, this._color.b/255, this._color.a/255);
        colors.push(this._color.r/255, this._color.g/255, this._color.b/255, this._color.a/255);

        // loop
        var len = path.length;
        for (var i=1; i<len-1; ++i){
            var pre = path[i-1];
            var cur = path[i];
            var nex = path[i+1];

            var uInc = cc.pDistance(cur, pre) / (halfWidth * 2);
            u += uInc;

            uvs.push(u, 0);
            uvs.push(u, 1);

            var left = this.calcLineLinkCornerLeft(pre, cur, nex, halfWidth);
            var right = cc.pSub(cc.pMult(cur, 2), left);

            vertices.push(left.x, left.y);
            vertices.push(right.x, right.y);

            colors.push(this._color.r/255, this._color.g/255, this._color.b/255, this._color.a/255);
            colors.push(this._color.r/255, this._color.g/255, this._color.b/255, this._color.a/255);
        }

        // last seg
        var lastLeft = cc.pAdd(path[len - 1], this.calcLineLeftNormal(path[len - 2], path[len - 1], halfWidth));
        var lastRight = cc.pSub(cc.pMult(path[len - 1], 2), lastLeft);
        var lastSegLen = cc.pDistance(path[len - 1], path[len - 2]);
        u += (lastSegLen / (halfWidth * 2));
        uvs.push(u, 0);
        uvs.push(u, 1);
        vertices.push(lastLeft.x, lastLeft.y);
        vertices.push(lastRight.x, lastRight.y);
        colors.push(this._color.r/255, this._color.g/255, this._color.b/255, this._color.a/255);
        colors.push(this._color.r/255, this._color.g/255, this._color.b/255, this._color.a/255);

        // indice
        for (i=0; i<len-1; ++i){
            var offset =  i * 2;
            indice.push(offset + 0);
            indice.push(offset + 1);
            indice.push(offset + 2);

            indice.push(offset + 1);
            indice.push(offset + 3);
            indice.push(offset + 2);
        }

        // mesh
        var mesh = new CMesh();
        mesh.vertices = vertices;
        mesh.uvs = uvs;
        mesh.colors = colors;
        mesh.triangles = indice;

        return mesh;
    }
});

module.exports = LineDrawNode;
