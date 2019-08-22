var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var PrizePoolRank = require("../entity/PrizePoolRank");
var AudioHelper = require("../../common/util/AudioHelper");
var MessageDialogData = require("../../common/events/MessageDialogData");
var CommonEvent = require("../../common/events/CommonEvent");
var MessageDialogType = require("../../common/events/MessageDialogType");
var EventDispatcher = require("../../common/events/EventDispatcher");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var numeral = require('numeral');
var SlotEvent = require("../events/SlotEvent");
/**
 * Created by alanmars on 15/5/21.
 */
var JackpotSelectBetItemController = function () {
    BaseCCBController.call(this);
    this._blueBg = 0;
    this._redBg = null;
    this._playItem = null;
    this._rightItem = null;
    this._yellowLabel = null;
    this._blueLabel = null;
    this._betLabel = null;
    this._jackpotLabel = null;

    this.bet = 0;
    this.parentController = null;
    this.itemHeight = 0;
    this.itemWidth = 0;
};

Util.inherits(JackpotSelectBetItemController, BaseCCBController);

JackpotSelectBetItemController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.itemHeight = this._blueBg.height + 2;
    this.itemWidth = this._blueBg.width;
};

/**
 *
 * @param bet
 * @param taxRatio
 * @param rewardRatio
 */
JackpotSelectBetItemController.prototype.initWith = function (bet, taxRatio, rewardRatio, jackpotValue, parent) {
    this.bet = bet;
    this.parentController = parent;
    this._betLabel.setString(Util.formatAbbrNumWithoutComma(bet));
    this._jackpotLabel.setString(Util.getCommaNum(jackpotValue * rewardRatio));
    if(rewardRatio == 1) {
        this._blueLabel.visible = false;
        this._yellowLabel.visible = true;
        this._redBg.visible = true;
        this._blueBg.visible = false;
        this._yellowLabel.setString(Util.sprintf("%d%%", rewardRatio * 100));
    } else {
        this._blueLabel.visible = true;
        this._yellowLabel.visible = false;
        this._redBg.visible = false;
        this._blueBg.visible = true;
        this._blueLabel.setString(Util.sprintf("%d%%", rewardRatio * 100));
    }
};

JackpotSelectBetItemController.prototype.playClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    ClassicSlotMan.getInstance().setJackpotBet(this.bet);
    if(this.parentController) {
        this.parentController.close();
    }
};

JackpotSelectBetItemController.createFromCCB = function () {
    return Util.loadNodeFromCCB("slot/jackpot/slot_jackpot_selectbet_item.ccbi", null, "JackpotSelectBetItemController", new JackpotSelectBetItemController());
};

module.exports = JackpotSelectBetItemController;