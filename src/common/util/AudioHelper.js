var AudioPlayer =  require("../audio/AudioPlayer");
var Util = require("../util/Util");
/**
 * Created by qinning on 15/4/27.
 */

var AudioHelper = {
    playBtnClickSound : function(){
        AudioPlayer.getInstance().playEffectByKey("btn-click");
    },

    playSlotEffect : function(effectName, loop) {
        AudioPlayer.getInstance().playEffectByKey(Util.sprintf("slots/%s", effectName), loop);
    },

    playCardEffect: function (effectName, loop) {
        AudioPlayer.getInstance().playEffectByKey(Util.sprintf("cards/%s", effectName), loop);
    },

    playTaskEffect: function (effectName, loop) {
        AudioPlayer.getInstance().playEffectByKey(Util.sprintf("tasks/%s", effectName), loop);
    }
};

module.exports = AudioHelper;

