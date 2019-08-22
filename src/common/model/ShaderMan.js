/**
 * Created by ZenQhy on 16/3/22.
 */

var BaseShader = require("../shader/BaseShader");
var SpriteBlurShader = require("../shader/SpriteBlurShader");

var ShaderMan = cc.Class.extend({
    blurShader : null,

    ctor: function() {
        this.initShaderEntity();
    },

    initShaderEntity: function() {
        this.blurShader = new SpriteBlurShader();
    }
});

ShaderMan._instance = null;
ShaderMan._firstUseInstance = true;

/**
 *
 * @returns {PlayerMan}
 */
ShaderMan.getInstance = function () {
    if (ShaderMan._firstUseInstance) {
        ShaderMan._firstUseInstance = false;
        ShaderMan._instance = new ShaderMan();
    }
    return ShaderMan._instance;
};

module.exports = ShaderMan;