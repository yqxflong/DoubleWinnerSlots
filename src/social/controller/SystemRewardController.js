var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var SystemRewardData = require("../../social/entity/SystemRewardData");
var ThemeName = require("../../common/enum/ThemeName");
var Config = require("../../common/util/Config");
var RewardType = require("../../social/enum/RewardType");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var ProductType = require("../../common/enum/ProductType");

/**
 * Created by alanmars on 15/5/21.
 */
var SystemRewardController = function () {
    BaseCCBController.call(this);
    this._closeItem = null;
    this._rewardLabel = null;
    this._rewardInfo = null;
    this._rewardIcon = null;

    this.rewardId = 0;

    this._descLabels = [];

    this._isKeyReward = false;
    this._isVideoAdReward = false;
    this._rewardChips = 0;
};

Util.inherits(SystemRewardController, BaseCCBController);

SystemRewardController.prototype.onEnter = function () {
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.HIDE_MAIL_EDIT_BOX, true);
};

SystemRewardController.prototype.onExit = function () {
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.HIDE_MAIL_EDIT_BOX, false);
};

/**
 * @param {Reward} reward
 */
SystemRewardController.prototype.initWith = function (reward) {
    this._isKeyReward = false;
    this._isVideoAdReward = false;
    this._rewardInfo.visible = false;
    this._closeItem.visible = false;
    this.rewardId = reward.id;
    switch(reward.type) {
        case RewardType.SYSTEM_REWARD:
            var systemReward = new SystemRewardData();
            systemReward.unmarshal(JSON.parse(reward.rewardData));
            var msgArr = Util.getSplitArr(systemReward.msg, 34, " ");
            this.initDescriptions(msgArr);
            break;
        case RewardType.FB_INVITE_REWARD:
            var msgArr = ["You have invited a friends"];
            this.initDescriptions(msgArr);
            break;
        case RewardType.BIND_FACEBOOK_REWARD:
            var msgArr = ["THANKS FOR LOGGING", "IN WITH FACEBOOK!"];
            this.initDescriptions(msgArr);
            break;
        case RewardType.REWARD_VIDEO_REWARD:
            msgArr = ["You've just earned", "REWARD COINS."];
            this.initDescriptions(msgArr);
            this._isVideoAdReward = true;
            this._rewardChips = reward.chipCount;
            break;
        case RewardType.REWARD_INCENTIVE_AD:
            msgArr = ["You've just earned", "FREE COINS."];
            this.initDescriptions(msgArr);
            break;
    }
    this._rewardLabel.setString(Util.getCommaNum(reward.chipCount));
    Util.scaleCCLabelBMFontWithMaxScale(this._rewardLabel, 208, 0.9);
    this.updateRewardIcon(reward.prodType);
};

SystemRewardController.prototype.initWithKeyReward = function (keyReward) {
    this._rewardInfo.visible = false;
    this._closeItem.visible = false;
    this._isKeyReward = true;
    this.initDescriptions(["You have received free coins!"]);
    this._rewardLabel.setString(Util.getCommaNum(keyReward.chips));
    Util.scaleCCLabelBMFontWithMaxScale(this._rewardLabel, 208, 0.9);
    this._rewardChips = keyReward.chips;
};

/**
 * ProductType
 * @param {ProductType} prodType
 */
SystemRewardController.prototype.updateRewardIcon = function (prodType) {
    var spriteFrameFileName = "casino_coin.png";
    switch (prodType) {
        case ProductType.PRODUCT_TYPE_CHIP:
            spriteFrameFileName = "common_icon_coins_s.png";
            break;
        case ProductType.PRODUCT_TYPE_GEM:
            spriteFrameFileName = "common_icon_gems_s.png";
            break;
        case ProductType.PRODUCT_TYPE_STAR:
            spriteFrameFileName = "common_icon_clover_s.png";
            break;
    }
    var spriteFrame = cc.spriteFrameCache.getSpriteFrame(spriteFrameFileName);
    if (spriteFrame) {
        this._rewardIcon.setSpriteFrame(spriteFrame);
    }
};

SystemRewardController.prototype.initDescriptions = function (descTxts) {
    var scale;
    var gap = 10;
    var fontName = "common/fonts/win_font_46.fnt";
    scale = 0.7;
    if (descTxts.length >= 4) {
        scale = 0.6;
    }
    var labelHeight = 57 * scale;
    var totalHeight = descTxts.length * labelHeight + (descTxts.length - 1) * gap;
    for (var i = 0; i < descTxts.length; ++i) {
        this._descLabels[i] = new cc.LabelBMFont(descTxts[i], fontName);
        this._descLabels[i].x = this._rewardInfo.x;
        this._descLabels[i].y = this._rewardInfo.y + totalHeight / 2 - (labelHeight + gap) * i - labelHeight * 0.5;
        this._descLabels[i].scaleX = scale;
        this._descLabels[i].scaleY = scale;
        this.rootNode.addChild(this._descLabels[i]);
    }
};

SystemRewardController.prototype.collectClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.onCloseItemClicked(sender);
};

SystemRewardController.prototype.onCloseItemClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    DialogManager.getInstance().close(this.rootNode, true);
    if(this._isKeyReward || this._isVideoAdReward) {
        //sync coins
        var PlayerMan = require("../../common/model/PlayerMan");
        PlayerMan.getInstance().addChips(this._rewardChips, true);
    } else {
        var SocialMan = require("../../social/model/SocialMan");
        SocialMan.getInstance().claimReward([this.rewardId]);
    }
};

SystemRewardController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

SystemRewardController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/casino_dialog_system_reward.ccbi", null, "SystemRewardController", new SystemRewardController());
};

module.exports = SystemRewardController;