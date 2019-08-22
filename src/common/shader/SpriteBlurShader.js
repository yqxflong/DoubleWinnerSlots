/**
 * Created by ZenQhy on 16/3/22.
 */

var BaseShader = require("./BaseShader");

var SpriteBlurShader = BaseShader.extend({
    ctor: function() {
        this._super("shader/example_Blur.fsh");
    },

    initShader: function() {
        if( 'opengl' in cc.sys.capabilities ) {
            if (cc.sys.isNative) {
                this.shader = new cc.GLProgram(this.vshPathForNative, this.fshPath);
                this.shader.link();
                this.shader.updateUniforms();
            }
            else {
                this.shader = new cc.GLProgram(this.vshPathForWeb, this.fshPath);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);

                this.shader.link();
                this.shader.updateUniforms();
                this.shader.use();
                this.shader.setUniformLocationWith2f(this.shader.getUniformLocationForName("blurSize"), 0, 0);
            }
        }
    },

    addShaderToSprite: function(sprite) {
        if( 'opengl' in cc.sys.capabilities ) {
            if (cc.sys.isNative) {
                var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this.shader);
                glProgram_state.setUniformVec2("blurSize", {x: 0, y: 0});
                sprite.setGLProgramState(glProgram_state);
            } else {
                sprite.shaderProgram = this.shader;
            }
        }
    },

    updateBlurSize: function (xSize, ySize) {
        if( 'opengl' in cc.sys.capabilities ) {
            if(cc.sys.isNative){
                this.sprite.getGLProgramState().setUniformVec2("blurSize", {x: xSize, y: ySize});
            }else{
                this.shader.use();
                this.shader.setUniformLocationWith2f(this.shader.getUniformLocationForName('blurSize'), xSize, ySize);
                this.shader.updateUniforms();
            }
        }
    }
});

module.exports = SpriteBlurShader;