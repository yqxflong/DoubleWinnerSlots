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
var DropSlotScene = require("./DropSlotScene");
var SlotEvent = require("../events/SlotEvent");
var AudioPlayer = require("../../common/audio/AudioPlayer");

var MagicWorld60103SlotScene = DropSlotScene.extend({
    ctor: function () {
        this.freeSpinBarNode = null;

        this.collectFrameNode = null;
        this.collectBar = null;

        this._super();
    },

    createExtraUI: function () {
        var spinRegion = this.subjectTmpl.panels[0].spinRegion;
        var spinRegionScale = this.subjectTmpl.panels[0].spinRegionScale;

        this.freeSpinBarNode = new cc.Node();
        this.addChild(this.freeSpinBarNode, this.ZORDER_COLLECT_BAR);

        var collectBarScale = 1.0;
        if(!DeviceInfo.isHighResolution()) {
            collectBarScale = 0.85;
        }

        var collectBarSprite = new cc.Sprite("#loading_progress_3x5_castle.png");
        this.collectBar = new cc.ProgressTimer(collectBarSprite);
        this.collectBar.type = cc.ProgressTimer.TYPE_BAR;
        this.collectBar.setAnchorPoint(cc.p(0.5, 0.0));
        this.collectBar.midPoint = cc.p(0.5, 0.0);
        this.collectBar.barChangeRate = cc.p(0, 1);
        this.collectBar.setPosition(spinRegion.x + spinRegion.width * spinRegionScale.x * 0.4 * (1 - collectBarScale), spinRegion.y + 80 * collectBarScale + spinRegion.height * 0.5 * (1 - collectBarScale));
        this.collectBar.setScale(collectBarScale);
        this.collectBar.setPercentage(0);
        this.freeSpinBarNode.addChild(this.collectBar);

        this.collectFrameNode = Util.loadNodeFromCCB("magic_world/60103/ui/loading.ccbi", null);
        this.collectFrameNode.setPosition(spinRegion.x + spinRegion.width * spinRegionScale.x * 0.4 * (1 - collectBarScale), spinRegion.y + spinRegion.height * 0.5);
        this.collectFrameNode.setScale(collectBarScale);
        this.freeSpinBarNode.addChild(this.collectFrameNode);

        this._super();
    },

    onSubRoundStart: function () {
        this.collectBar.setPercentage(0);
        this.showNormalCollectBarAnimation();
        this._super();
    },

    onSubRoundStartInFreeSpin: function () {
        this.collectBar.setPercentage(0);
        this.showNormalCollectBarAnimation();
        this._super();
    },

    onShowSpecialTaskAnimationEnd: function () {
        var curProgress = this.slotMan.spinPanelIndex + 1;
        var curPercent = this.getCurProgressPercent(curProgress);
        this.collectBar.runAction(cc.progressTo(0.5, curPercent));
        this.freeSpinBarNode.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.showCollectBarAnimation, this, curProgress)));
        var audioIndex = curProgress;
        if(audioIndex > 7) audioIndex = 8;
        AudioPlayer.getInstance().playEffectByKey(Util.sprintf("slots/magic_world60103/bomb%d", audioIndex), false, true);
        this._super();
    },

    onShowSpecialTaskAnimationEndInFreeSpin: function () {
        var curProgress = this.slotMan.spinPanelIndex + 1;
        var curPercent = this.getCurProgressPercent(curProgress);
        this.collectBar.runAction(cc.progressTo(0.5, curPercent));
        this.freeSpinBarNode.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.showCollectBarAnimation, this, curProgress)));
        var audioIndex = curProgress;
        if(audioIndex > 7) audioIndex = 8;
        AudioPlayer.getInstance().playEffectByKey(Util.sprintf("slots/magic_world60103/bomb%d", audioIndex), false, true);
        this._super();
    },

    showCollectBarAnimation: function (sender, index) {
        var animIndex = index;
        if(animIndex > 6) animIndex = 8;
        var animName = Util.sprintf("0%d", animIndex);
        this.collectFrameNode.animationManager.runAnimationsForSequenceNamed(animName);
    },

    showNormalCollectBarAnimation: function () {
        this.collectFrameNode.animationManager.runAnimationsForSequenceNamed("normal");
    },

    getCurProgressPercent: function (progress) {
        var percent = 0;
        if(progress <= 0) percent = 0;
        else if(progress >= 7) percent = 100;

        switch(progress) {
            case 1:
                percent = 13.51;
                break;
            case 2:
                percent = 26.58;
                break;
            case 3:
                percent = 39.65;
                break;
            case 4:
                percent = 52.72;
                break;
            case 5:
                percent = 65.8;
                break;
            case 6:
                percent = 78.88;
                break;
            case 7:
                percent = 100;
                break;
        }

        return percent;
    },

    onShowFreeSpinWelcome: function () {
        this.functionNode.controller.enableFreeSpin();
        this.slotMan.isInFreeSpin = true;
        PopupMan.popupFreeSpinDlg(this.slotMan.leftFreeSpinCount, MessageDialogType.SLOT_START_FREE_SPIN);
        AudioPlayer.getInstance().playEffectByKey("slots/bonus-game-appear");
    }
});

module.exports = MagicWorld60103SlotScene;