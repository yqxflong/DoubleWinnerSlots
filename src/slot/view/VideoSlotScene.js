var NormalSlotScene = require("./NormalSlotScene");
var DrumMode = require("../enum/DrumMode");
var SymbolId = require("../enum/SymbolId");
var PrizePoolType = require("../enum/PrizePoolType");
/**
 * Created by qinning on 15/8/25.
 */
var VideoSlotScene = NormalSlotScene.extend({
    createExtraUI: function() {
        if (this.subjectTmpl.prizePoolType == PrizePoolType.PRIZE_POOL_POPUP) {
        } else {
            this._super();
        }
    },
    /**
     * @param {Array.<number>} drumState - every element is DrumMode at the given column
     * @returns {boolean}
     */
    getJackpotDrumState: function (drumState) {
        return this.getFullColumnDrumState(drumState, SymbolId.SYMBOL_ID_JACKPOT, DrumMode.DRUM_MODE_BLINK_JACKPOT);
    },
    
    getFullColumnDrumState: function (drumState, specialSymbolId, drumMode) {
        var i;
        var drum = [];
        var hasSpecialSymbol = false;
        var globalCol;
        for (i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drum[i] = DrumMode.DRUM_MODE_NULL;
        }
        var checkDrumSoundCount = 2;
        var checkDrumCount = 3;
        var continuousSymbolCount = 0;
        var spinLayerIndices = this.getSpinLayerIndices();
        var isBreak = false;
        for (i = 0; i < spinLayerIndices.length; ++i) {
            var panelConfig = this.subjectTmpl.panels[spinLayerIndices[i]];
            for (var localCol = 0; localCol < panelConfig.slotCols; ++localCol) {
                hasSpecialSymbol = false;
                globalCol = localCol + panelConfig.colShift;
                for (var localRow = 0; localRow < panelConfig.slotRows; ++localRow) {
                    var symbolId = this.getSpinResult(localCol + panelConfig.colShift, localRow + panelConfig.rowShift);
                    if (symbolId == specialSymbolId) {
                        hasSpecialSymbol = true;
                        continuousSymbolCount++;
                        drum[globalCol] = drumMode;
                        break;
                    }
                }
                if (globalCol == this.subjectTmpl.reelCol - 1 && !hasSpecialSymbol) {
                    drum[globalCol] = drumMode;
                } else if (!hasSpecialSymbol) {
                    if (continuousSymbolCount >= checkDrumSoundCount) {
                        if (continuousSymbolCount >= checkDrumCount) {
                            drum[globalCol] = drumMode;
                        } else {
                            drum[globalCol] = DrumMode.DRUM_MODE_NULL;
                        }
                        isBreak = true;
                        break;
                    } else {
                        return false;
                    }
                }
            }
            if (isBreak) {
                break;
            }
        }
        for(i = 0; i < drum.length; ++i) {
            if (i < checkDrumCount && drum[i] == drumMode) {
                drumState[i] = drumMode;
            } else if (i >= checkDrumCount && drum[i] == drumMode) {
                drumState[i] = DrumMode.DRUM_MODE_DRUM;
            } else {
                drumState[i] = DrumMode.DRUM_MODE_NULL;
            }
        }
        cc.log("drumState:" + JSON.stringify(drumState));
        return true;
    },

    onCheckConnectedAreas: function () {
        var layerIndices;
        layerIndices = this.getSpinLayerIndices();
        var hasConnectedArea = false;
        for (i = 0; i < layerIndices.length; ++i) {
            if(this.spinLayers[layerIndices[i]].getConnectedArea()) {
                hasConnectedArea = true;
            };
        }

        if(hasConnectedArea) {
            this.addConnectedAreaAnim();
        }
    }
});

module.exports = VideoSlotScene;