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

var MagicWorld60101SlotScene = SpecialTaskSlotScene.extend({
    onCheckSpecialInfo: function () {
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo != null) {
            if (spinExtraInfo.lockedIds.length > 0) {
                this.addSpecialAnimation();
            }
        }
    },

    onSpecialAnimationEnd: function () {
        if (this.slotMan.isLastSpinPanel()) {
            this.setLayerRespinEnd();
        }
        this._super();
    },

    respinStart: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices; ++ i) {
            this.spinLayers[spinLayerIndices[i]].onRoundStart();
        }
        this.onSubRoundStart();
    },

    onRespinStart: function () {
        this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.respinStart, this)));
    },

    onRespinEnd: function () {
        if (this.slotMan.isLastSpinPanel()) {
            this.setLayerRespinEnd();
            this.onSubRoundEnd();
        }
        else {
            this.onRespinStart();
        }
    },

    onSpinResultShow: function () {
        if (!this.hasSpecialAnim) {
            this.showTotalWin();
        }

        this.updateTaskProgress();
        this.updateDailyTaskProgress();

        this.setCurrentSpinStep(SpinStep.SLOT_SHOW_RESULT);
        if (this.checkAndShowWinLine()) {
            //if (!this.hasBonus() && !this.hasScatter()) {
            //    if (this.checkTaskProgressCompletedAndShow()) {
            //    } else {
            //        this.setCurrentSpinStep(SpinStep.SLOT_SPIN_END);
            //        this.setSpinEnabled(true);
            //    }
            //}
        }
        else if (this.checkAndShowBonusOrScatter()) {
        }
        else {
            this.onRespinEnd();
        }
    },


    onBonusEnd: function () {
        this.onRespinEnd();
    },

    onBlinkScatterEnd: function () {
        this.onRespinEnd();
    },

    onRespinEndInFreeSpin: function () {
        if (this.slotMan.isLastSpinPanel()) {
            this.onSubRoundEndInFreeSpin();
        }
        else {
            this.onRespinStartInFreeSpin();
        }
    },

    onRespinStartInFreeSpin: function () {
        this.onRespinStart();
    },

    onSpinResultShowInFreeSpin: function () {
        if (!this.hasSpecialAnim) {
            this.showTotalWin();
        }

        this.updateTaskProgress();
        this.updateDailyTaskProgress();

        this.setCurrentSpinStep(SpinStep.SLOT_SHOW_RESULT);
        if (this.checkAndShowWinLine()) {
        }
        else if (this.checkAndShowBonusOrScatter()) {
        }
        else {
            this.onRespinEndInFreeSpin();
        }
    },

    onShowSpecialTaskAnimationEndInFreeSpin: function () {
        if (this.checkAndShowBonusOrScatter()) {
        }
        else {
            this.onRespinEndInFreeSpin();
        }
    },

    onBlinkScatterEndInFreeSpin: function () {
        this.onRespinEndInFreeSpin();
    },

    setLayerRespinEnd: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++ i) {
            var spinLayer = this.spinLayers[spinLayerIndices[i]];
            spinLayer.onRespinFinished();
        }
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

        if(hasConnectedArea || (this.slotMan.getSpinPanelLength() > 1 && this.slotMan.isLastSpinPanel())) {
            this.addConnectedAreaAnim();
        }
    }
});

module.exports = MagicWorld60101SlotScene;