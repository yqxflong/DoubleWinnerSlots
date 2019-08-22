var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var MessageDialogData = require("../../common/events/MessageDialogData");
var MessageDialogType = require("../../common/events/MessageDialogType");
var AudioHelper = require("../../common/util/AudioHelper");
var PopupMan = require("../../common/model/PopupMan");
var PlayerMan = require("../../common/model/PlayerMan");
var JackpotStatus = require("../enum/JackpotStatus");
var JackpotType = require("../enum/JackpotType");
var FlagStoneJackpotController = require("./FlagStoneJackpotController");
var SlotConfigMan = require("../config/SlotConfigMan");
var ClassicSlotMan = require("../model/ClassicSlotMan");

/**
 * Created by alanmars on 15/7/15.
 */
var SlotEnterConfirmController = function () {
    BaseCCBController.call(this);
    this.DISPLAY_BET_COUNT = 4;
    this.NORMAL_BET_COUNT = 2;
    this.JACKPOT_BET_COUNT = 2;

    this._jackpotNode = null;
    this._jackpotAnchorNode = null;

    this._normalNode = null;
    this._subjectNameLabel = null;

    this._playLabel1 = null;
    this._playLabel2 = null;
    this._playLabel3 = null;
    this._playLabel4 = null;
    this._subjectThemeSprite = null;
    this._subjectReelSprite = null;

    this.playLabels = [];

    this.usedBetList = null;

    this.jackpotId = 0;
};

Util.inherits(SlotEnterConfirmController, BaseCCBController);

SlotEnterConfirmController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

SlotEnterConfirmController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

SlotEnterConfirmController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.playLabels.push(this._playLabel1);
    this.playLabels.push(this._playLabel2);
    this.playLabels.push(this._playLabel3);
    this.playLabels.push(this._playLabel4);
};

SlotEnterConfirmController.prototype.initWith = function (subject) {
    var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);

    var flagStoneSpriteFrame = cc.spriteFrameCache.getSpriteFrame(Util.sprintf("slot_lobby_flagstone_%s.png", subjectTmpl.resRootDir));
    if (flagStoneSpriteFrame) {
        this._subjectThemeSprite.setSpriteFrame(flagStoneSpriteFrame);
    }
    if (this._subjectReelSprite) {
        var reelSpriteFrame = cc.spriteFrameCache.getSpriteFrame(Util.sprintf("jackpot_symbol_%s.png", subjectTmpl.resRootDir));
        if (reelSpriteFrame) {
            this._subjectReelSprite.setSpriteFrame(reelSpriteFrame);
        }
    }
    var betList = SlotConfigMan.getInstance().getBetList(subject.subjectId, PlayerMan.getInstance().player.level);
    this.usedBetList = [];

    var i;
    if (subject.jackpotStatus === JackpotStatus.JACKPOT_STATUS_OPEN && subject.jackpotType === JackpotType.JACKPOT_TYPE_TIME_ACCU) {
        this._normalNode.visible = false;
        this._jackpotNode.visible = true;

        var jackpotTitleNode = FlagStoneJackpotController.createFromCCBig();
        this._jackpotAnchorNode.addChild(jackpotTitleNode);
        jackpotTitleNode.controller.initWith(subject);

        var jackpotInfo = subject.jackpotInfoList[0];
        var normalBetList = [];
        var jackpotBetList = [];
        for (i = 0; i < betList.length; ++ i) {
            if (betList[i]*subjectTmpl.getMaxLineCount() < jackpotInfo.thresholdBet) {
                normalBetList.push(betList[i]);
            } else {
                jackpotBetList.push(betList[i]);
            }
        }

        for (i = 0; i < this.NORMAL_BET_COUNT; ++ i) {
            this.playLabels[i].setString(Util.sprintf("PLAY %s/Line", Util.getCommaNum(normalBetList[i])));
            this.usedBetList.push(normalBetList[i]);
        }
        for (i = 0; i < this.JACKPOT_BET_COUNT; ++ i) {
            this.playLabels[i + this.NORMAL_BET_COUNT].setString(Util.sprintf("PLAY %s/Line", Util.getCommaNum(jackpotBetList[i])));
            this.usedBetList.push(jackpotBetList[i]);
        }

        this.jackpotId = jackpotInfo.jackpotId;
    } else {
        this._normalNode.visible = true;
        this._jackpotNode.visible = false;

        this._subjectNameLabel.setString(subjectTmpl.displayName);

        for (i = 0; i < this.DISPLAY_BET_COUNT; ++ i) {
            this.playLabels[i].setString(Util.sprintf("PLAY %s/Line", Util.getCommaNum(betList[i])));
            this.usedBetList.push(betList[i]);
        }
    }
};

SlotEnterConfirmController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

SlotEnterConfirmController.prototype.onCloseItemClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    DialogManager.getInstance().close(this.rootNode, true);
};

SlotEnterConfirmController.prototype.onPlayItemTriggered = function (sender) {
    ClassicSlotMan.getInstance().setBet(this.usedBetList[sender.getTag() - 1]);
    ClassicSlotMan.getInstance().jackpotId = this.jackpotId;

    var SceneType = require("../../common/enum/SceneType");
    var SceneMan = require("../../common/model/SceneMan");
    SceneMan.getInstance().switchScene(SceneType.SLOT_ROOM);

    DialogManager.getInstance().close(this.rootNode, true);
};

SlotEnterConfirmController.createFromCCB = function() {
    return Util.loadNodeFromCCB("slot/lobby/slot_lobby_ui_confirm.ccbi", null, "SlotEnterConfirmController", new SlotEnterConfirmController());
};

module.exports = SlotEnterConfirmController;