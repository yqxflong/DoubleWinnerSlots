/**
 * Created by qinning on 15/12/31.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var AudioHelper = require("../../common/util/AudioHelper");
var HourlyGameMan = require("../model/HourlyGameMan");
var PopupMan = require("../../common/model/PopupMan");
var SocialEvents = require("../events/SocialEvents");
var EventDispatcher = require("../../common/events/EventDispatcher");
var PlayerMan = require("../../common/model/PlayerMan");

var HourlyBonusUpgradeItemAnimController = function () {

};

Util.inherits(HourlyBonusUpgradeItemAnimController, BaseCCBController);

HourlyBonusUpgradeItemAnimController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_cardup_s.ccbi", null, "HourlyBonusUpgradeItemAnimController", new HourlyBonusUpgradeItemAnimController());
};

var HourlyBonusUpgradeItemController = function () {
    this._cardIcon = null;
    this._starLabel = null;
    this._cardLvLabel = null;
    this._upgradeItem = null;
    this._starIcon = null;
    this._upgradeLabel = null;
    this._maxLvItem = null;
    this._animNode = null;
    this._upgradeAnimNode = null;
    this._starMaskLayer = null;

    /**
     * @type {HourlyGameCardData}
     * @private
     */
    this._cardData = null;
    /**
     * @type {HourlyGameCardLevelConfigData}
     * @private
     */
    this._nextLevelConfig = null;
};

Util.inherits(HourlyBonusUpgradeItemController, BaseCCBController);

HourlyBonusUpgradeItemController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(SocialEvents.SOCIAL_CARD_UPGRADED, this.cardUpgraded, this);
};

HourlyBonusUpgradeItemController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(SocialEvents.SOCIAL_CARD_UPGRADED, this.cardUpgraded, this);
};

HourlyBonusUpgradeItemController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

/**
 * @param {HourlyGameCardData} cardData
 */
HourlyBonusUpgradeItemController.prototype.initWithCard = function (cardID) {

    this._cardData = HourlyGameMan.getInstance().getCardConfigData(cardID);

    this._cardLvLabel.setString(Util.sprintf("LV.%d", this._cardData.level));

     if (this._cardData.nextLevelId > 0) {
        this._starLabel.visible = true;
        this._starIcon.visible = true;
        this._upgradeItem.visible = true;
   //     this._upgradeLabel.visible = true;
        this._starLabel.setString(HourlyGameMan.getInstance().getCardConfigData(this._cardData.nextLevelId).starsNeed);
        this._maxLvItem.visible = false;
        this._starMaskLayer.visible = true;
        this.updateUpgradeItem();
    } else {
        this._upgradeItem.visible = false;
  //      this._upgradeLabel.visible = false;
        this._starLabel.visible = false;
        this._starIcon.visible = false;
        this._maxLvItem.visible = true;
        this._starMaskLayer.visible = false;
    }
    var cardName = this._cardData.getCardName(true);
    var spriteFrame = cc.spriteFrameCache.getSpriteFrame(cardName);
    if (spriteFrame) {
        this._cardIcon.setSpriteFrame(spriteFrame);
    }
};

HourlyBonusUpgradeItemController.prototype.updateUpgradeItem = function () {
    if (this._cardData.nextLevelId > 0) {

        var nextCardCfgData = HourlyGameMan.getInstance().getCardConfigData(this._cardData.nextLevelId);

        if (PlayerMan.getInstance().getStars() >= nextCardCfgData.starsNeed) {
            this._upgradeItem.enabled = true;
        } else {
            this._upgradeItem.enabled = false;
        }
    }
};

HourlyBonusUpgradeItemController.prototype.cardUpgraded = function (event) {
    if (!this._cardData) return;
    var cardUpdateInfo = event.getUserData();
    if (this._cardData.id == cardUpdateInfo.oldCardId) {

        this._upgradeItem.enabled = true;
        this.initWithCard(cardUpdateInfo.cardId);
        if (this._upgradeAnimNode) {
            this._upgradeAnimNode.removeFromParent();
            this._upgradeAnimNode = null;
        }
        this._upgradeAnimNode = HourlyBonusUpgradeItemAnimController.createFromCCB();
        this._animNode.addChild(this._upgradeAnimNode);
        this._upgradeAnimNode.animationManager.runAnimationsForSequenceNamed("anim");
    } else {
        this.updateUpgradeItem();
    }
};

HourlyBonusUpgradeItemController.prototype.upgradeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this._upgradeItem.enabled = false;
    HourlyGameMan.getInstance().upgradeHourlyGameCard(this._cardData.id);
};

HourlyBonusUpgradeItemController.prototype.getContentSize = function () {
    return cc.size(120, 250);
};

HourlyBonusUpgradeItemController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_upgrade_item.ccbi", null, "HourlyBonusUpgradeItemController", new HourlyBonusUpgradeItemController());
};

module.exports = HourlyBonusUpgradeItemController;