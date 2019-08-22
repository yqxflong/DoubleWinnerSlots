/**
 * Created by alanmars on 15/7/16.
 */
var Util = require("../../common/util/Util");
var SlotConfigMan = require("../config/SlotConfigMan");
var BaseCCBController = require("./../../common/controller/BaseCCBController");

var JackpotStatusController = function() {
    this._minBetLabel = null;
};

Util.inherits(JackpotStatusController, BaseCCBController);

JackpotStatusController.prototype.onEnter = function () {
};

JackpotStatusController.prototype.onExit = function () {
};

/**
 * @param {boolean} isOn
 * @param {number} thresholdBet
 */
JackpotStatusController.prototype.initWith = function (isOn, thresholdBet) {
    if (!isOn) {
        this._minBetLabel.setString(Util.sprintf("MIN BET: %s", Util.getCommaNum(thresholdBet)));
    }
};

JackpotStatusController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

JackpotStatusController.createOnFromCCB = function() {
    return Util.loadNodeFromCCB("slot/jackpot/slot_jackpot_status_on.ccbi", null, "JackpotStatusController", new JackpotStatusController());
};

JackpotStatusController.createOffFromCCB = function() {
    return Util.loadNodeFromCCB("slot/jackpot/slot_jackpot_status_off.ccbi", null, "JackpotStatusController", new JackpotStatusController());
};

module.exports = JackpotStatusController;