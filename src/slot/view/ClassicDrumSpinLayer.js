var ClassicSpinLayer = require("./ClassicSpinLayer");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var SymbolId = require("../enum/SymbolId");
var SlotSpinStepEndType = require("../events/SlotSpinStepEndType");
var SpinState = require("../enum/SpinState");
var SlotMan = require("../model/SlotMan");
var SymbolAnimEffect = require("../enum/SymbolAnimEffect");
var DrumMode = require("../enum/DrumMode");
var ClassicSlotMan = require("../model/ClassicSlotMan");

var ClassicDrumSpinLayer = ClassicSpinLayer.extend({
    isHaveDrumMode: false,

    hasDrumMode: function (localCol) {
        if (this.spinEndColCount == localCol && this.drumModeState[localCol] >= 0 && !this.isHaveDrumMode) {
            this.isHaveDrumMode = true;
            return true;
        }
        return false;
    },

    stopDrumModeAnim: function (localCol) {
        this._super(localCol);
        this.isHaveDrumMode = false;
    },

    onShowDrumBonus: function (localCol) {
        AudioPlayer.getInstance().playEffectByKey(Util.sprintf("slots/fx-bonus-appear%d", localCol + 1));
    },

    hasScatterBonusJackpotInCol: function (localCol) {
        var chips = this.spinPanel.chips;
        var multiple = chips / ClassicSlotMan.getInstance().getCurrentTotalBet();
        if (localCol == this.subjectTmpl.reelCol - 1 && multiple >= 6) {
            return true;
        } else {
            return false;
        }
    },

    showBonusAppearAudio: function (localCol) {
        AudioPlayer.getInstance().playEffectByKey("slots/fx-bonus-appear3");
    }
});

module.exports = ClassicDrumSpinLayer;