var SpecialTaskSlotScene = require("./SpecialTaskSlotScene");
var DrumMode = require("../enum/DrumMode");
var SymbolId = require("../enum/SymbolId");

var MagicWorld60110SlotScene = SpecialTaskSlotScene.extend({
    onCheckSpecialInfo: function () {
        var extraInfo = this.spinPanel.extraInfo;
        if(!extraInfo) return;

        if(extraInfo.wildArray.length > 0 || extraInfo.bonusPos.length > 0 || extraInfo.moreFreeSpin.length > 0) {
            this.addSpecialAnimation();
        }
    },

    getBonusDrumStateNormal: function (drumState) {
        var i;
        var colCount = 0;
        var drum = [];
        for (i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drum[i] = DrumMode.DRUM_MODE_NULL;
        }

        for (var col = 0; col < 3; ++col) {
            for (var row = 0; row < this.subjectTmpl.reelRow; row++) {
                var tmpSymbolId = this.getSpinResult(col, row);
                if (tmpSymbolId == SymbolId.SYMBOL_ID_BONUS) {
                    ++colCount;
                    drum[col] = DrumMode.DRUM_MODE_BLINK_BONUS;
                    break;
                }
            }
        }

        if (colCount >= 2) {
            for (i = 0; i < drum.length; ++i) {
                if (drum[i] == DrumMode.DRUM_MODE_BLINK_BONUS) {
                    drumState[i] = DrumMode.DRUM_MODE_BLINK_BONUS;
                }
            }
            drumState[4] = DrumMode.DRUM_MODE_DRUM;
            return true;
        }
        return false;
    }
});

module.exports = MagicWorld60110SlotScene;