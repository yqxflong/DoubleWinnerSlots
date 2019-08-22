/**
 * Created by qinning on 15/5/5.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var HourlyGameMan = require("../model/HourlyGameMan");
var HourlyGameCardType = require("../enum/HourlyGameCardType");

var HourlyBonusCardController = function () {
    this._cardIcon = null;
    this._cardBackIcon = null;
    this._cardLockIcon = null;

    this._isLockCard = false;
    this._isShowed = false;
    /**
     * show card anim end callback
     * @type {Function}
     * @private
     */
    this._onShowCardAnimEndCallback = null;

    /**
     * @type {HourlyGameCardReward}
     * @private
     */
    this._cardReward = null;
};

Util.inherits(HourlyBonusCardController, BaseCCBController);

HourlyBonusCardController.prototype.onEnter = function () {
};

HourlyBonusCardController.prototype.onExit = function () {
};

HourlyBonusCardController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.showCardBack();
};

HourlyBonusCardController.prototype.getContentSize = function () {
    return this._cardBackIcon.getContentSize();
};

/**
 * @param {HourlyGameCardReward} cardReward
 * @param {Function} showCardAnimEndCallback
 */
HourlyBonusCardController.prototype.initWithCardInfo = function (cardReward, showCardAnimEndCallback) {
    this._cardReward = cardReward;
    this._onShowCardAnimEndCallback = showCardAnimEndCallback;
    var cardId = cardReward.id;
    var cardConfigData = HourlyGameMan.getInstance().getCardConfigData(cardId);
    var spriteFrame;
    if (cardConfigData.type == HourlyGameCardType.HOURLY_GAME_CARD_TYPE_SPECIAL) {
        var cardName = cardConfigData.getCardName(true);
        spriteFrame = cc.spriteFrameCache.getSpriteFrame(cardName);
        if (spriteFrame) {
            this._cardIcon.setSpriteFrame(spriteFrame);
        }
    }
    else if (cardConfigData.type == HourlyGameCardType.HOURLY_GAME_CARD_TYPE_NORMAL || cardConfigData.type == HourlyGameCardType.HOURLY_GAME_CARD_TYPE_SMALL) {

        spriteFrame = cc.spriteFrameCache.getSpriteFrame(cardConfigData.getCardName(true));
        if (spriteFrame) {
            this._cardIcon.setSpriteFrame(spriteFrame);
        }
    } else {
        throw new Error(Util.sprintf("not supported HourlyGameCardType:%d", cardConfigData.type));
    }
};

/**
 * show turn card animation.
 * @param {boolean} isTakeAll
 */
HourlyBonusCardController.prototype.showTurnCardAnim = function (isTakeAll) {
    if (this._isLockCard) return;
    if (this._isShowed) return;
    this._isShowed = true;
    this._cardIcon.visible = true;
    this.rootNode.setLocalZOrder(1);
    var sequenceName = "animation";
    if (isTakeAll) {
        sequenceName = "take all";
    }
    this.rootNode.animationManager.runAnimationsForSequenceNamed(sequenceName);
};

HourlyBonusCardController.prototype.onShowCardAnimEnd = function () {
    this.rootNode.setLocalZOrder(0);
    if (this._onShowCardAnimEndCallback) {
        this._onShowCardAnimEndCallback(this.rootNode, this._cardReward);
    }
};

HourlyBonusCardController.prototype.showCardBack = function () {
    this._isLockCard = false;
    this.rootNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");
    this._cardIcon.visible = false;
    this._cardBackIcon.visible = true;
    this._cardLockIcon.visible = false;
};

HourlyBonusCardController.prototype.lockCard = function () {
    this._isLockCard = true;
    this.rootNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");
    this._cardIcon.visible = false;
    this._cardBackIcon.visible = true;
    this._cardLockIcon.visible = true;
};

HourlyBonusCardController.prototype.boundingBox = function () {
    var cardIconBoundingBox = this._cardIcon.getBoundingBox();
    cardIconBoundingBox.x += this.rootNode.x;
    cardIconBoundingBox.y += this.rootNode.y;
    return cardIconBoundingBox;
};

HourlyBonusCardController.prototype.isShowed = function () {
    return this._isShowed;
};

HourlyBonusCardController.prototype.isLocked = function () {
    return this._isLockCard;
};


HourlyBonusCardController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_card.ccbi", null, "HourlyBonusCardController", new HourlyBonusCardController());
};

module.exports = HourlyBonusCardController;