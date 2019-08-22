/**
 * Created by ZhonglinGuo on 16/6/16.
 */

var CMesh = function () {

    this.vertexElemCount = 2;
    this.uvElemCount = 2;
    this.colorElemCount = 4;

    this.vertices = null;
    this.uvs = null;
    this.colors = null;
    this.triangles = null;
};

CMesh.createQuad = function () {
    var mesh = new CMesh();
    mesh.vertices = [
        0, 0,
        100, 0,
        100, 100,
        0, 100,
    ];

    mesh.uvs = [
        0, 0,
        1, 0,
        1, 1,
        0, 1
    ];

    mesh.colors = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
    ];

    mesh.triangles = [
        0, 1, 2, 0, 2, 3
    ];

    return mesh;
};

module.exports = CMesh;