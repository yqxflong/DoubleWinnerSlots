/**
 * Created by qinning on 15/12/31.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var HourlyGameMan = require("../model/HourlyGameMan");

var HourlyBonusCollectItemController = function () {
    this.CARD_NAME_MAX_WIDTH = 270;

    this._cardIcon = null;
    this._winLabel = null;
    /**
     * @type {HourlyGameCollectData}
     * @private
     */
    this._gameCollectData = null;
};

Util.inherits(HourlyBonusCollectItemController, BaseCCBController);

HourlyBonusCollectItemController.prototype.onEnter = function () {
};

HourlyBonusCollectItemController.prototype.onExit = function () {
};

HourlyBonusCollectItemController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

/**
 * @param {HourlyGameCollectData} collectData
 */
HourlyBonusCollectItemController.prototype.initWithCollectData = function (collectData) {
     if (collectData.cardConfigData) {

            var cardName = collectData.cardConfigData.getCardName(true);
            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(cardName);

            if (spriteFrame) {
                this._cardIcon.setSpriteFrame(spriteFrame);
            }

    }
    this._winLabel.setString(Util.getCommaNum(collectData.chips));
};

HourlyBonusCollectItemController.prototype.getContentSize = function () {
    return new cc.size(320, 80);
};

HourlyBonusCollectItemController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_collect_item.ccbi", null, "HourlyBonusCollectItemController", new HourlyBonusCollectItemController());
};

module.exports = HourlyBonusCollectItemController;