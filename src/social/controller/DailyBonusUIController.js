/**
 * Created by qinning on 15/5/5.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var PlayerMan = require("../../common/model/PlayerMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../../slot/events/SlotEvent");
var CommonEvent = require("../../common/events/CommonEvent");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var SlotConfigMan = require("../../slot/config/SlotConfigMan");
var ProductType = require("../../common/enum/ProductType");
var C2SGetDailyBonus = require("../protocol/C2SGetDailyBonus");
var DialogManager = require("../../common/popup/DialogManager");
var DailyBonusUIItemController = require("./DailyBonusUIItemController");
var PopupMan = require("../../common/model/PopupMan");
var AudioHelper = require("../../common/util/AudioHelper");


var ITEM_WIDTH = 120;
var ITEM_NUM = 7;
var DailyBonusUIController = function (dailyBonus) {
    this._collectItem = null;
    this._closeItem = null;

    this._dailyBonus = dailyBonus;
    this._totalClaimChips = 0;
};

Util.inherits(DailyBonusUIController, BaseCCBController);

DailyBonusUIController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.DAILY_BONUS_RECEIVED, this.onReceivedCollectChips,this);
};

DailyBonusUIController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.DAILY_BONUS_RECEIVED, this.onReceivedCollectChips,this);
};

DailyBonusUIController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.initUI();
};

DailyBonusUIController.prototype.initUI = function () {
    var dailyRewardCount = 0;
    for (var i = 0; i < ITEM_NUM; ++i) {
        var itemNode = DailyBonusUIItemController.createFromCCB();
        itemNode.x = (i - ITEM_NUM * 0.5 + 0.5) * ITEM_WIDTH;
        this._bonusNode.addChild(itemNode);
        var isReward = (i + 1 == this._dailyBonus.continuousDayCount);
        if (isReward) {
            dailyRewardCount = this._dailyBonus.dailyBonusList[i].count;
        }
        itemNode.controller.bindData(this._dailyBonus.dailyBonusList[i], i + 1, isReward);
    }
    this._totalClaimChips = this._dailyBonus.baseBonus.count + dailyRewardCount;
};

DailyBonusUIController.prototype.collectClicked = function (event) {
    AudioHelper.playBtnClickSound();
    PopupMan.popupIndicator();
    var BonusMan = require("../model/BonusMan");
    BonusMan.getInstance().sendClaimDailyBonusCmd();
};

DailyBonusUIController.prototype.closeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    DialogManager.getInstance().close(this.rootNode);
};

DailyBonusUIController.prototype.onReceivedCollectChips = function(event) {
    PlayerMan.getInstance().addChips(this._totalClaimChips,true);
    var LogMan = require("../../log/model/LogMan");
    var ProductChangeReason = require("../../log/enum/ProductChangeReason");
    LogMan.getInstance().userProductRecord(ProductChangeReason.GET_DAILY_BONUS, 0, this._totalClaimChips, 0, 0, 0);
    this.closeClicked();
};

DailyBonusUIController.popup = function (dailyBonus) {
    var node = Util.loadNodeFromCCB("casino/daily_bonus/daily_bonus_bg.ccbi", null, "DailyBonusUIController", new DailyBonusUIController(dailyBonus));
    DialogManager.getInstance().popup(node);
};

module.exports = DailyBonusUIController;