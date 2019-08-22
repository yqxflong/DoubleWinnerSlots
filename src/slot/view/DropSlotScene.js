/**
 * Created by ZenQhy on 16/4/20.
 */

var SpecialTaskSlotScene = require("./SpecialTaskSlotScene");
var SpinStep = require("../enum/SpinStep");
var DrumMode = require("../enum/DrumMode");
var SlotNoticeType = require("../events/SlotNoticeType");
var WinLevel = require("../enum/WinLevel");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");

var DropSlotScene = SpecialTaskSlotScene.extend({

    onSpinResultReceived: function () {
        this.hasSpecialAnim = false;
        this.spinPanel = this.slotMan.getSpinPanel();
        this.handleSpinResult();
        this.handleWinRate();
        this.handleMegaSymbols(this.spinPanel);
        this.onCheckSpecialInfo();
        this.sendSpinResultToSpinLayers();
        this.onCheckConnectedAreas();
        this.setCurrentSpinStep(SpinStep.SLOT_RESULT_RECEIVED);

        if(!this.slotMan.isFirstSpinPanel()) {
            this.checkDelayEvents();
        }
    },

    handleSpinResult: function () {
        if(this.slotMan.isFirstSpinPanel()) {
            if (this.spinPanel.jackpotTriggered) {
                this.slotMan.jackpotWinCoins = this.spinPanel.jackpotWin;
                this.slotMan.pushNoticeEvent(SlotNoticeType.SLOT_NOTICE_JACKPOT);
            }
            else {
                if (this.spinPanel.winLevel == WinLevel.MEGA_WIN) {
                    this.slotMan.pushNoticeEvent(SlotNoticeType.SLOT_NOTICE_MEGA_WIN);
                }
                else if (this.spinPanel.winLevel == WinLevel.BIG_WIN) {
                    this.slotMan.pushNoticeEvent(SlotNoticeType.SLOT_NOTICE_BIG_WIN);
                }
                else {
                }
            }
        }

        this.slotMan.pushNoticeEvent(SlotNoticeType.SLOT_NOTICE_SPIN_RESULT_START);
    },

    sendSpinResultToSpinLayers: function () {
        var i;
        var spinLayerIndices = this.getSpinLayerIndices();
        for (i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onSpinResultReceived(this.spinPanel);
        }

        if(this.slotMan.isFirstSpinPanel()) {
            var drumState = [];
            var spinRowCounts = this.calSpinRowCountWhenResultReceived(drumState);
            for (i = 0; i < spinLayerIndices.length; ++i) {
                this.spinLayers[spinLayerIndices[i]].setSpinRowCounWhenResultReceived(spinRowCounts);
            }
        }
    },

    checkDrumMode: function () {
        var drumState = [];
        for (var i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drumState[i] = DrumMode.DRUM_MODE_NULL;
        }
        return drumState;
    },

    onCheckSpecialInfo: function () {
        if(!this.slotMan.isFirstSpinPanel()) {
            this.addSpecialAnimation();
        }
    },

    onSpecialAnimation: function () {
        this.setCurrentSpinStep(SpinStep.SLOT_SPECIAL_ANIMATION);

        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onSpecialAnimation();
        }
    },

    onShowSpecialTaskAnimationEnd: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].explodeAllWinLineSymbols();
        }

        this.slotMan.getSpinResultFromServer();
    },

    onShowSpecialTaskAnimationEndInFreeSpin: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].explodeAllWinLineSymbols();
        }

        this.slotMan.getSpinResultFromServer();
    },

    onSpinResultShow: function () {
        if (!this.hasSpecialAnim) {
            this.showTotalWin();
        }

        this.updateTaskProgress();
        this.updateDailyTaskProgress();

        this.setCurrentSpinStep(SpinStep.SLOT_SHOW_RESULT);
        if (this.checkAndShowWinLine()) {
            if (!this.hasBonus() && !this.hasScatter()) {
                //if (this.checkTaskProgressCompletedAndShow()) {
                //}
                //else {
                //    if(this.slotMan.isLastSpinPanel()) {
                //        this.setCurrentSpinStep(SpinStep.SLOT_SPIN_END);
                //        this.setSpinEnabled(true);
                //    }
                //}
            }
        }
        else if (this.checkAndShowBonusOrScatter()) {
        }
        else {
            this.onSubRoundEnd();
        }
    },

    showTotalWin: function () {
        if (this.hasWinLine()) {
            this.updateOutput(Util.sprintf("YOU GET %d WIN LINES AND %s COINS", this.getNormalWinLines().length, Util.getCommaNum(this.slotMan.curWinChips)));
        }

        if(this.slotMan.isFirstSpinPanel()) {
            EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_WIN_RATE_CHANGED, null);
        }
        else {
            EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_WIN_RATE_CHANGED, false);
        }
    }
});

module.exports = DropSlotScene;