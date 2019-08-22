/**
 * Created by JianWang on 7/21/16.
 */
var AntialiasingLineNode = require("./AntialiasingLineNode");

var TextureAnimationLineNode =  AntialiasingLineNode.extend({

    animationUV_SHADER_Vert:
    "attribute vec4 a_position; \n"
    + "attribute vec2 a_texCoord; \n"
    + "attribute vec4 a_color;  \n"
    + "uniform vec2 u_movespeed;  \n"
    + "varying lowp vec4 v_fragmentColor; \n"
    + "varying mediump vec2 v_texCoord; \n"
    + "void main() \n"
    + "{ \n"
    + "    gl_Position = (CC_PMatrix * CC_MVMatrix) * a_position;  \n"
    + "    v_fragmentColor = a_color; \n"
    + "    v_texCoord.x = a_texCoord.x + u_movespeed.x * CC_Time[1]; \n"
    + "    v_texCoord.y = a_texCoord.y + u_movespeed.y * CC_Time[1]; \n"
    + "}",
    animationUV_SHADER_Frag:
    "precision lowp float;\n"
    + "varying vec4 v_fragmentColor; \n"
    + "varying vec2 v_texCoord; \n"
    + "void main() \n"
    + "{ \n"
    + "    gl_FragColor = v_fragmentColor * texture2D(CC_Texture0, v_texCoord); \n"
    + "}",

    moveSpeed:{x:1.0,y:1.0},

    ctor:function(pointsOnLine, lineWidth, lineColor, lineTexture, uvRepeatInterval) {

        this._super(pointsOnLine,lineWidth,lineColor, lineTexture, uvRepeatInterval);
        this._shaderProgram = new cc.GLProgram();
        this._shaderProgram.initWithString(this.animationUV_SHADER_Vert, this.animationUV_SHADER_Frag);


        if(cc.sys.isMobile) {
            this._shaderProgram.link();
            this._shaderProgram.updateUniforms();
            var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this._shaderProgram);
            this.setGLProgramState(glProgram_state);
        }
        else
        {
            this._shaderProgram.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
            this._shaderProgram.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
            this._shaderProgram.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);

            this._shaderProgram.link();
            this._shaderProgram.updateUniforms();
            this._shaderProgram.use();
            this._shaderProgram.setUniformLocationWith2f(this._shaderProgram.getUniformLocationForName('u_movespeed'), this.moveSpeed.x,this.moveSpeed.y);
        }

    },
    updateRenderParameter:function( ) {
        this._super();

        if(cc.sys.isNative)
        {
           var loc = gl.getUniformLocation(this.shaderProgram.getProgram(), "u_movespeed");
           gl.uniform2f(loc, this.moveSpeed.x, this.moveSpeed.y);
        }

    },
});

module.exports = TextureAnimationLineNode;