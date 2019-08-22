/**
 * Created by ZenQhy on 16/3/22.
 */

var BaseShader = cc.Class.extend({
    shader : null,
    vshPathForWeb : "",
    vshPathForNative : "",
    fshPath : "",

    ctor: function(fsh) {
        this.vshPathForWeb = "shader/example_Outline.vsh";
        this.vshPathForNative = "shader/example_Outline_noMVP.vsh";
        this.fshPath = fsh;

        this.initShader();
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
            }
        }
    },

    addShaderToSprite: function(sprite) {
        if( 'opengl' in cc.sys.capabilities ) {
            if (cc.sys.isNative) {
                var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this.shader);
                sprite.setGLProgramState(glProgram_state);
            } else {
                sprite.shaderProgram = this.shader;
            }
        }
    }
});

module.exports = BaseShader;