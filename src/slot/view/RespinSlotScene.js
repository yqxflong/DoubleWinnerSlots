var Util = require("../../common/util/Util");
var NormalSlotScene = require("./NormalSlotScene");
var Constants = require("../../common/enum/Constants");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var AudioHelper = require("../../common/util/AudioHelper");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var DeviceInfo = require("../../common/util/DeviceInfo");
var SpinStep = require("../enum/SpinStep");

/**
 * Created by alanmars on 15/8/17.
 */
var RespinSlotScene = NormalSlotScene.extend({
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
                if (!this.hasBonus() && !this.hasScatter()) {
                    this.setSpinEnabled(true);
                }
            } else if (this.checkAndShowBonusOrScatter()) {
            } else {
                this.onSubRoundEnd();
            }
        } else {
            //TODO it works only when scatter is invalid in re-spin mode
            this.checkAndShowWinLine();
            //this.onRespinStart();
            this.runAction(cc.sequence(cc.delayTime(this.getNextSpinInterval()), cc.callFunc(this.onRespinStart, this)));
        }
    },

    onRespinStart: function () {
        this.playRespinEffect();
        if (!this.hasWinLine()) {
            var leftReSpins = this.slotMan.getSpinPanelLength() - this.slotMan.spinPanelIndex - 1;
            var outputStr = "Re-spins left: " + leftReSpins.toString();
            this.updateOutput(outputStr);
        }

        this.spinLayers[0].onRespinStart();
        this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.respinStart, this)));
    },

    playRespinEffect: function () {
        AudioHelper.playSlotEffect("double-win-win");
    },

    respinStart: function () {
        this.slotMan.getSpinResultFromServer();

        this.setCurrentSpinStep(SpinStep.SLOT_SPIN_START);
        var layers = this.getSpinLayerIndices();
        for (var i = 0; i < layers.length; ++ i) {
            this.spinLayers[layers[i]].onRoundStart();
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

    showTotalWin: function () {
        if (this.hasWinLine()) {
            this.updateOutput(Util.sprintf("YOU GET %d WIN LINES AND %s COINS", this.getNormalWinLines().length, Util.getCommaNum(this.slotMan.curWinChips)));
        } else {
            this.updateOutput("");
        }

        EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_WIN_RATE_CHANGED, null);
    },

    setLayerRespinEnd: function () {
        var layers = this.getSpinLayerIndices();
        for (var i = 0; i < layers.length; i++) {
            this.spinLayers[layers[i]].onRespinFinished();
        }
    },

    onShowSpecialTaskAnimationEnd: function () {
        if (this.isLastSpinIndex()) {
            if (this.checkAndShowBonusOrScatter()) {
            } else if (!this.isAutoSpin()) {
                var spinLayerIndices = this.getSpinLayerIndices();
                for (var i = 0; i < spinLayerIndices.length; ++i) {
                    this.spinLayers[spinLayerIndices[i]].blinkWinLineInTurn();
                }
                this.onSubRoundEnd();
            } else {
                this.onSubRoundEnd();
            }
        }
    }
});

module.exports = RespinSlotScene;