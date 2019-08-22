/**
 * Created by ZhonglinGuo on 16/6/16.
 */

cc.GLNode = cc.GLNode || cc.Node.extend({
    ctor:function(){
        this._super();
        this.init();
    },
    init:function(){
        this._renderCmd._needDraw = true;
        this._renderCmd.rendering =  function(ctx){
            cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
            cc.kmGLPushMatrix();

            cc.kmGLLoadMatrix(this._stackMatrix);

            this._node.draw(ctx);

            cc.kmGLPopMatrix();
        };
    },
    draw:function(ctx){
        this._super(ctx);
    }
});

var CMeshRenderNode = cc.GLNode.extend({

    ctor:function(){
        this._super();
        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);

        this._vertexBuffer = null;
        this._uvBuffer = null;
        this._colorBuffer = null;
        this._indexBuffer = null;

        this._texture = null;
        this._mesh = null;
    },

    setMesh: function (mesh) {
        this._mesh = mesh;
        this.clearBuffers();
        this.initBuffers();
    },

    setTexture: function (texture) {
        this._texture = texture;
    },

    draw: function (ctx) {

        // active and bind texture
        this._shaderProgram.updateUniforms();
        this._shaderProgram.setUniformsForBuiltins();
        cc.glBindTexture2DN(0, this._texture);

        // enable attr
        //var enabledAttr = cc.VERTEX_ATTRIB_FLAG_POSITION;
        // 和shader参数匹配，0对应position，1对应texCoord，2对应Color
        gl.enableVertexAttribArray(0);
        if (this._colorBuffer) {
            //enabledAttr |= cc.VERTEX_ATTRIB_FLAG_COLOR;
            gl.enableVertexAttribArray(2);
        }
        if (this._uvBuffer) {
            //enabledAttr |= cc.VERTEX_ATTRIB_FLAG_TEX_COORDS;
            gl.enableVertexAttribArray(1);
        }
        //cc.glEnableVertexAttribs(enabledAttr);

        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, this._mesh.vertexElemCount, gl.FLOAT, false, 0, 0);

        if (this._colorBuffer){
            gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, this._mesh.colorElemCount, gl.FLOAT, false, 0, 0);
        }

        if (this._uvBuffer){
            gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, this._mesh.uvElemCount, gl.FLOAT, false, 0, 0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

        // draw
        gl.drawElements(gl.TRIANGLES, this._mesh.triangles.length, gl.UNSIGNED_SHORT, 0);

        // bind null
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    },

    initBuffers:function() {

        this._vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._mesh.vertices), gl.STATIC_DRAW);

        if (this._mesh.colors){
            this._colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._mesh.colors), gl.STATIC_DRAW);
        }

        if (this._mesh.uvs){
            this._uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._mesh.uvs), gl.STATIC_DRAW);
        }

        this._indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._mesh.triangles), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    },

    clearBuffers: function () {
        if (this._vertexBuffer){
            gl.deleteBuffer(this._vertexBuffer);
            this._vertexBuffer = null;
        }

        if (this._uvBuffer){
            gl.deleteBuffer(this._uvBuffer);
            this._uvBuffer = null;
        }

        if (this._colorBuffer){
            gl.deleteBuffer(this._colorBuffer);
            this._colorBuffer = null;
        }
    },

    cleanup: function () {
        this.clearBuffers();
        this._mesh = null;
        this._texture = null;
        this._super();
    }
});

module.exports = CMeshRenderNode;