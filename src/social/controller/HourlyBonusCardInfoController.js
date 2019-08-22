/**
 * Created by qinning on 15/12/31.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var PlayerMan = require("../../common/model/PlayerMan");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var HourlyGameMan = require("../model/HourlyGameMan");
var SocialEvents = require("../events/SocialEvents");
var EventDispatcher = require("../../common/events/EventDispatcher");
var PopupMan = require("../../common/model/PopupMan");


var HourlyBonusCardInfoAnimController = function () {
    this._oldCardIcon = null;
    this._newCardIcon = null;
};

Util.inherits(HourlyBonusCardInfoAnimController, BaseCCBController);

/**
 * update old and new.
 * @param {HourlyGameCardLevelConfigData} oldLevelConfig
 * @param {HourlyGameCardLevelConfigData} newLevelConfig
 */
HourlyBonusCardInfoAnimController.prototype.initWith = function (oldCardId) {
 
    var oldcarCfgData = HourlyGameMan.getInstance().getCardConfigData(oldCardId);
    
    if (oldcarCfgData) {
        var oldSpriteTexture = cc.textureCache.addImage(oldcarCfgData.getCardName(false));
        if (oldSpriteTexture) {
            this._oldCardIcon.setTexture(oldSpriteTexture);
        }
    }
    if(oldcarCfgData.nextLevelId > 0) {
        var newcarCfgData = HourlyGameMan.getInstance().getCardConfigData(oldcarCfgData.nextLevelId);
        if (newcarCfgData) {
            var newSpriteTexture = cc.textureCache.addImage(newcarCfgData.getCardName(false));
            if (newSpriteTexture) {
                this._newCardIcon.setTexture(newSpriteTexture);
            }
        }
    }
};

HourlyBonusCardInfoAnimController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_cardup_l.ccbi", null, "HourlyBonusCardInfoAnimController", new HourlyBonusCardInfoAnimController());
};

var HourlyBonusCardInfoController = function () {
    this.SELECT_COLOR = cc.color(0, 238, 253);
    this.SELECT_SCALE = 1.0;
    this.NO_SELECT_SCALE = 0.8;

    this._closeItem = null;
    this._upgradeItem = null;
    this._cardIcon = null;
    this._starNeedLabel = null;
    this._cardNameLabel = null;
    this._cardLvLabel = null;
    this._maxLvLabel = null;
    this._cardLv1PayoutLabel = null;
    this._cardLv2PayoutLabel = null;
    this._cardLv3PayoutLabel = null;
    this._cardLv4PayoutLabel = null;
    this._cardLv5PayoutLabel = null;

    this._cardLv1Label = null;
    this._cardLv2Label = null;
    this._cardLv3Label = null;
    this._cardLv4Label = null;
    this._cardLv5Label = null;

    this._starIcon = null;
    this._upgradeLabel = null;
    this._maxLvItem = null;
    this._animNode = null;

    this._cardAnimNode = null;

    /**
     * @type {Array.<cc.LabelTTF>}
     * @private
     */
    this._cardLvLabels = null;

    /**
     * @type {Array.<cc.LabelTTF>}
     * @private
     */
    this._cardLvNameLabels = null;

    /**
     * @type {HourlyGameCardConfigData}
     * @private
     */
    this._cardConfigData = null;

    /**
     * @type {HourlyGameCardData}
     * @private
     */
    this._cardId = null;
};

Util.inherits(HourlyBonusCardInfoController, BaseCCBController);

HourlyBonusCardInfoController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(SocialEvents.SOCIAL_CARD_UPGRADED, this.cardUpgraded, this);
};

HourlyBonusCardInfoController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(SocialEvents.SOCIAL_CARD_UPGRADED, this.cardUpgraded, this);
};

HourlyBonusCardInfoController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this._cardLvLabels = [this._cardLv1PayoutLabel, this._cardLv2PayoutLabel, this._cardLv3PayoutLabel, this._cardLv4PayoutLabel, this._cardLv5PayoutLabel];
    this._cardLvNameLabels = [this._cardLv1Label, this._cardLv2Label, this._cardLv3Label, this._cardLv4Label, this._cardLv5Label];
};

/**
 * show card info.
 * @param {number} cardId
 */
HourlyBonusCardInfoController.prototype.initWithCard = function (cardId) {
    
    var cardConfigData = HourlyGameMan.getInstance().getCardConfigData(cardId);
    this._cardId = cardId;
    this._cardNameLabel.setString(cardConfigData.name);


    var cardGroupBonus =  HourlyGameMan.getInstance().getCardGroupBonus(cardConfigData.cardGroupId);

    for (var i = 0; i < this._cardLvLabels.length; ++i) {

        this._cardLvLabels[i].setString(Util.getCommaNum(cardGroupBonus[i+1]));

        if (cardConfigData.level == i + 1) {
            this._cardLvLabels[i].setColor(this.SELECT_COLOR);
            this._cardLvNameLabels[i].setColor(this.SELECT_COLOR);
            this._cardLvLabels[i].setScale(this.SELECT_SCALE);
            this._cardLvNameLabels[i].setScale(this.SELECT_SCALE);
        } else {
            this._cardLvLabels[i].setColor(cc.color.WHITE);
            this._cardLvNameLabels[i].setColor(cc.color.WHITE);
            this._cardLvLabels[i].setScale(this.NO_SELECT_SCALE);
            this._cardLvNameLabels[i].setScale(this.NO_SELECT_SCALE);
        }
    }

    this._cardLvLabel.setString(Util.sprintf("LV. %d", cardConfigData.level));

    var cardName = cardConfigData.getCardName(false);
    this._cardIcon.setTexture(cc.textureCache.addImage(cardName));

    this.updateNextLevelConfig();
};

HourlyBonusCardInfoController.prototype.updateNextLevelConfig = function () {

    var cardConfigData = HourlyGameMan.getInstance().getCardConfigData(this._cardId);
    
    if (cardConfigData && cardConfigData.nextLevelId == 0) {
        this._starNeedLabel.visible = false;
        this._starIcon.visible = false;
      //  this._upgradeLabel.visible = false;
        this._upgradeItem.visible = false;
        if (this._maxLvItem) {
            this._maxLvItem.visible = true;
        }
        if (this._maxLvLabel) {
            this._maxLvLabel.visible = true;
        }
    } else {
        if (this._maxLvItem) {
            this._maxLvItem.visible = false;
        }
        if (this._maxLvLabel) {
            this._maxLvLabel.visible = false;
        }
        var nextCardConfigData = HourlyGameMan.getInstance().getCardConfigData(cardConfigData.nextLevelId);
        this._starNeedLabel.setString(nextCardConfigData.starsNeed);

        if (PlayerMan.getInstance().getStars() >= nextCardConfigData.starsNeed) {
            this._upgradeItem.enabled = true;
        } else {
            this._upgradeItem.enabled = false;
        }
    }
};

HourlyBonusCardInfoController.prototype.upgradeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    HourlyGameMan.getInstance().upgradeHourlyGameCard(this._cardId);
    this._upgradeItem.enabled = false;
};

HourlyBonusCardInfoController.prototype.cardUpgraded = function (event) {

    var cardUpdateInfo = event.getUserData();

    if (this._cardId == cardUpdateInfo.oldCardId) {

        if (this._cardAnimNode) {
            this._cardAnimNode.removeFromParent();
            this._cardAnimNode = null;
        }
        this._cardAnimNode = HourlyBonusCardInfoAnimController.createFromCCB();
        this._animNode.addChild(this._cardAnimNode);
        this._cardAnimNode.controller.initWith(this._cardId);
        this._cardAnimNode.animationManager.runAnimationsForSequenceNamed("anim");
        this.initWithCard(cardUpdateInfo.cardId);
    }
};

HourlyBonusCardInfoController.prototype.closeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this.close();
};

HourlyBonusCardInfoController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode);
};

HourlyBonusCardInfoController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

HourlyBonusCardInfoController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_card_info.ccbi", null, "HourlyBonusCardInfoController", new HourlyBonusCardInfoController());
};

module.exports = HourlyBonusCardInfoController;