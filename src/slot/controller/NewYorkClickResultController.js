/**
 * Created by qinning on 15/5/5.
 */
var Util = require("../../common/util/Util");
var SlotConfigMan = require("../config/SlotConfigMan");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var PlayerMan = require("../../common/model/PlayerMan");
var BonusAward = require("../entity/BonusAward");
var BonusType = require("../enum/BonusType");

var NewYorkClickResultController = function () {
    this._freeSpinCountLabel = null;
    this._winCoinGrayLabel = null;
    this._freeSpinNode = null;
    this._freeSpinGrayNode = null;
    this._winCoinLabel = null;
    this._winCoinGrayNode = null;
    this._freeSpinCountGrayLabel = null;
    this._winCoinNode = null;
    this._grayBg = null;
    this._brightBg = null;
};


Util.inherits(NewYorkClickResultController, BaseCCBController);

NewYorkClickResultController.prototype.onEnter = function () {
};

NewYorkClickResultController.prototype.onExit = function () {

};

NewYorkClickResultController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

/**
 *
 * @param {int} awardType
 * @param {int} awardValue
 * @param {bool} isAwarded
 */
NewYorkClickResultController.prototype.initWith = function (awardType, awardValue, isAwarded) {
    if(awardType == BonusType.BONUS_AWARD) {
        if(isAwarded) {
            this._winCoinNode.visible = true;
            this._winCoinGrayNode.visible = false;
            this._winCoinLabel.setString(Util.getCommaNum(awardValue));
        } else {
            this._winCoinNode.visible = false;
            this._winCoinGrayNode.visible = true;
            this._winCoinGrayLabel.setString(Util.getCommaNum(awardValue));
        }
        this._freeSpinNode.visible = false;
        this._freeSpinGrayNode.visible = false;
    } else {
        if(isAwarded) {
            this._freeSpinNode.visible = true;
            this._freeSpinGrayNode.visible = false;
            this._freeSpinCountLabel.setString(awardValue);
        } else {
            this._freeSpinNode.visible = false;
            this._freeSpinGrayNode.visible = true;
            this._freeSpinCountGrayLabel.setString(awardValue);
        }
        this._winCoinNode.visible = false;
        this._winCoinGrayNode.visible = false;
    }
};

NewYorkClickResultController.createFromCCB = function () {
    return Util.loadNodeFromCCB("newyork/reels/effect/newyork_click_result.ccbi", null, "NewYorkClickResultController", new NewYorkClickResultController());
};

module.exports = NewYorkClickResultController;