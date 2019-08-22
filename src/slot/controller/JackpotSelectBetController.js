var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var PrizePoolRank = require("../entity/PrizePoolRank");
var AudioHelper = require("../../common/util/AudioHelper");
var JackpotSelectBetItemController = require("./JackpotSelectBetItemController");

/**
 * Created by alanmars on 15/5/21.
 */
var JackpotSelectBetController = function () {
    BaseCCBController.call(this);
    this._containerNode = null;
};

Util.inherits(JackpotSelectBetController, BaseCCBController);

/**
 *
 * @param {BetAccuJackpotSubInfo} jackpotSubInfo
 */
JackpotSelectBetController.prototype.initWith = function (jackpotSubInfo) {
    var storeHeight = this._containerNode.height;
    var selectBetItem = JackpotSelectBetItemController.createFromCCB();
    var itemHeight = selectBetItem.controller.itemHeight;
    var itemWidth = selectBetItem.controller.itemWidth;
    var gap = (storeHeight - itemHeight * jackpotSubInfo.bets.length) / (jackpotSubInfo.bets.length - 1);

    var jackpotValue = jackpotSubInfo.jackpotValue;
    for(var i = 0; i < jackpotSubInfo.bets.length; ++i) {
        var bet = jackpotSubInfo.bets[i];
        var taxRatio = jackpotSubInfo.taxRatios[i];
        var rewardRatio = jackpotSubInfo.rewardRatios[i];
        var jackpotSelectBetItem = JackpotSelectBetItemController.createFromCCB();
        jackpotSelectBetItem.controller.initWith(bet, taxRatio, rewardRatio, jackpotValue, this);
        jackpotSelectBetItem.y = storeHeight - ((i + 0.5) * itemHeight + gap*i);
        jackpotSelectBetItem.x = itemWidth / 2 + 5;
        this._containerNode.addChild(jackpotSelectBetItem);
    }
};

JackpotSelectBetController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

JackpotSelectBetController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

JackpotSelectBetController.prototype.close = function() {
    DialogManager.getInstance().close(this.rootNode, true);
};

JackpotSelectBetController.createFromCCB = function () {
    return Util.loadNodeFromCCB("slot/jackpot/slot_jackpot_selectbet.ccbi", null, "JackpotSelectBetController", new JackpotSelectBetController());
};

module.exports = JackpotSelectBetController;