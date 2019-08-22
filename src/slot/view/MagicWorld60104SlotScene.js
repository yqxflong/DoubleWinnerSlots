var NormalSlotScene = require("./NormalSlotScene");
var DeviceInfo = require("../../common/util/DeviceInfo");
var SpinStep = require("../enum/SpinStep");
var DrumMode = require("../enum/DrumMode");
var PopupMan = require("../../common/model/PopupMan");
var MessageDialogType = require("../../common/events/MessageDialogType");
var SymbolId = require("../enum/SymbolId");
var Coordinate = require("../entity/Coordinate");
var EventDispatcher = require("../../common/events/EventDispatcher");
var MessageDialogData = require("../../common/events/MessageDialogData");
var CommonEvent = require("../../common/events/CommonEvent");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var SpecialTaskSlotScene = require("./SpecialTaskSlotScene");
var SlotEvent = require("../events/SlotEvent");
var AudioHelper = require("../../common/util/AudioHelper");

var MagicWorld60104SlotScene = SpecialTaskSlotScene.extend({
    onCheckSpecialInfo: function () {
        var extraInfo = this.spinPanel.extraInfo;
        if(!extraInfo) return;

        if(extraInfo.bonusWild.length > 0 || extraInfo.multipleWildList.length > 0) {
            this.addSpecialAnimation();
        }
    },

    isLastSpinIndex: function () {
        return this.slotMan.spinPanelIndex >= (this.slotMan.getSpinPanelLength() - 1);
    },

    onSpecialAnimationEnd: function () {
        if (this.isLastSpinIndex()) {
            this.setLayerRespinEnd();
        }
        this._super();
    },

    onRespinEnd: function () {
        if (this.isLastSpinIndex()) {
            this.setLayerRespinEnd();
            if (this.checkAndShowWinLine()) {
            }
            else if (this.checkAndShowBonusOrScatter()) {
            }
            else {
                this.onSubRoundEnd();
            }
        }
        else {
            this.runAction(cc.sequence(cc.delayTime(this.getNextSpinInterval()), cc.callFunc(this.onRespinStart, this)));
        }
    },

    onRespinEndInFreeSpin: function () {
        if (this.isLastSpinIndex()) {
            this.setLayerRespinEnd();
            if (this.checkAndShowWinLine()) {
            }
            else if (this.checkAndShowBonusOrScatter()) {
            }
            else {
                this.onSubRoundEndInFreeSpin();
            }
        }
        else {
            this.runAction(cc.sequence(cc.delayTime(this.getNextSpinInterval()), cc.callFunc(this.onRespinStart, this)));
        }
    },

    onRespinStart: function () {
        this.playRespinEffect();

        this.spinLayers[0].onRespinStart();
        this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.respinStart, this)));
    },

    playRespinEffect: function () {
        //AudioHelper.playSlotEffect("double-win-win");
    },

    respinStart: function () {
        this.slotMan.getSpinResultFromServer();
        this.setCurrentSpinStep(SpinStep.SLOT_SPIN_START);
        var layers = this.getSpinLayerIndices();
        for (var i = 0; i < layers.length; ++ i) {
            this.spinLayers[layers[i]].onSubRoundStart();
            this.spinLayers[layers[i]].onSpinStart();
        }
        this.sendSpinResultToSpinLayers();
        this.setCurrentSpinStep(SpinStep.SLOT_RESULT_RECEIVED);

        this.playBgMusic();
        AudioHelper.playSlotEffect("fx-spin");
    },

    onSpinResultShow: function () {
        this.setCurrentSpinStep(SpinStep.SLOT_SHOW_RESULT);
        this.showTotalWin();

        this.updateTaskProgress();
        this.updateDailyTaskProgress();

        this.onRespinEnd();
    },

    onSpinResultShowInFreeSpin: function () {
        this.setCurrentSpinStep(SpinStep.SLOT_SHOW_RESULT);
        this.showTotalWin();

        this.updateTaskProgress();
        this.updateDailyTaskProgress();

        this.onRespinEndInFreeSpin();
    },

    setLayerRespinEnd: function () {
        this.isLocked = false;
        var layers = this.getSpinLayerIndices();
        for (var i = 0; i < layers.length; i++) {
            this.spinLayers[layers[i]].onRespinFinished();
        }
    },

    onShowSpecialTaskAnimationEnd: function () {
        if (this.isLastSpinIndex()) {
            if (this.checkAndShowBonusOrScatter()) {
            }
            else if (!this.isAutoSpin()) {
                var spinLayerIndices = this.getSpinLayerIndices();
                for (var i = 0; i < spinLayerIndices.length; ++i) {
                    this.spinLayers[spinLayerIndices[i]].blinkWinLineInTurn();
                }
                this.onSubRoundEnd();
            } else {
                this.onSubRoundEnd();
            }
        }
    },

    getScatterDrumState: function (drumState) {
        return this.getScatterDrumStateColumn(drumState);
    },

    getDrumStateCol: function (drumState, symbolId, drumMode) {
        var i;
        var colCount = 0;
        var drum = [];
        for (i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drum[i] = DrumMode.DRUM_MODE_NULL;
        }

        for (var col = 0; col < this.subjectTmpl.reelCol; ++col) {
            for (var row = 0; row < this.subjectTmpl.reelRow; row++) {
                var tmpSymbolId = this.getSpinResult(col, row);
                if (symbolId == tmpSymbolId) {
                    ++colCount;
                    drum[col] = drumMode;
                    break;
                }
            }
        }

        if (colCount >= 3) {
            if (colCount == 3 && drum[this.subjectTmpl.reelCol - 1] == drumMode) {
                return false;
            }
            var drumModeCount = 0;
            for (i = 0; i < drum.length; ++i) {
                if (drum[i] == drumMode) {
                    drumModeCount++;
                    if (drumModeCount > 3) {
                        drumState[i] = DrumMode.DRUM_MODE_DRUM;
                    } else {
                        drumState[i] = drumMode;
                    }
                } else {
                    if (drumModeCount >= 3) {
                        drumState[i] = DrumMode.DRUM_MODE_DRUM;
                    } else {
                        drumState[i] = drum[i];
                    }
                }
            }
            return true;
        }
        return false;
    }
});

module.exports = MagicWorld60104SlotScene;