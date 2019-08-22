var SpecialTaskSlotScene = require("./SpecialTaskSlotScene");

var MagicWorld60102SlotScene = SpecialTaskSlotScene.extend({
    hasWinLine: function () {
        var result = this.getNormalWinLines().length > 0;
        if(!result) {
            var panelConfig = this.subjectTmpl.panels[0];
            for(var col = 0; col < panelConfig.slotCols; col++) {
                for(var row = 0; row < panelConfig.slotRows; row++) {
                    var symbolId = this.getSpinResult(col, row);
                    if(symbolId >= 1101 && symbolId <= 1105) {
                        result = true;
                        break;
                    }
                }
            }
        }
        return result;
    },

    onlyHasWinLine: function() {
        return this.getNormalWinLines().length > 0;
    },

    onShowSpecialTaskAnimationEnd: function () {
        if (this.checkAndShowBonusOrScatter()) {
        }
        else if (!this.isAutoSpin()) {
            if(this.onlyHasWinLine()) {
                var spinLayerIndices = this.getSpinLayerIndices();
                for (var i = 0; i < spinLayerIndices.length; ++i) {
                    this.spinLayers[spinLayerIndices[i]].blinkWinLineInTurn();
                }
            }
            this.onSubRoundEnd();
        }
        else {
            this.onSubRoundEnd();
        }
    }
});

module.exports = MagicWorld60102SlotScene;