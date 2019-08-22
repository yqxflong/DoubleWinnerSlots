var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var PrizePoolRank = require("../entity/PrizePoolRank");
var AudioHelper = require("../../common/util/AudioHelper");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");

/**
 * Created by alanmars on 15/5/21.
 */
var PrizePoolRewardController = function () {
    BaseCCBController.call(this);
    this.rewardId = 0;
    this._rankLabel = null;
    this._rewardLabel = null;

    this.closeCallback = null;
};

Util.inherits(PrizePoolRewardController, BaseCCBController);

PrizePoolRewardController.prototype.onEnter = function () {
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.HIDE_MAIL_EDIT_BOX, true);
};

PrizePoolRewardController.prototype.onExit = function () {
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.HIDE_MAIL_EDIT_BOX, false);
    if(this.closeCallback) {
        this.closeCallback(this.rewardId);
    }
};

/**
 * @param {Reward} prizePoolReward
 */
PrizePoolRewardController.prototype.initWith = function (prizePoolReward) {
    this.rewardId = prizePoolReward.id;
    var prizePoolRank = new PrizePoolRank(JSON.parse(prizePoolReward.rewardData));
    this._rankLabel.setString(Util.sprintf("%d/%d", prizePoolRank.rank, prizePoolRank.playerNum));
    this._rewardLabel.setString(Util.getCommaNum(prizePoolReward.chipCount));

    Util.scaleCCLabelBMFontWithMaxScale(this._rewardLabel, 208, 0.9);
};

PrizePoolRewardController.prototype.initWithCallback = function (callback) {
    this.closeCallback = callback;
};

PrizePoolRewardController.prototype.onCollectItemClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.onCloseItemClicked(sender);
};

PrizePoolRewardController.prototype.onCloseItemClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    DialogManager.getInstance().close(this.rootNode, true);
    var SocialMan = require("../../social/model/SocialMan");
    SocialMan.getInstance().claimReward([this.rewardId]);
};

PrizePoolRewardController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

PrizePoolRewardController.createFromCCB = function () {
    return Util.loadNodeFromCCB("slot/prize_pool/prize_pool_reward_dialog.ccbi", null, "PrizePoolRewardController", new PrizePoolRewardController());
};

module.exports = PrizePoolRewardController;