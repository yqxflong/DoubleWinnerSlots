var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var PrizePoolPlayer = require("../entity/PrizePoolPlayer");
var ClassicSlotMan = require("../model/ClassicSlotMan");

/**
 * Created by alanmars on 15/5/14.
 */
var S2CPrizePoolResult = function() {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_PRIZE_POOL_RESULT);
    /**
     * rewards for top 3
     * @type {Array.<number>}
     */
    this.rewards = null;
    /**
     * players in rank top 3
     * @type {Array.<PrizePoolPlayer>}
     */
    this.players = null;
};

Util.inherits(S2CPrizePoolResult, LogicProtocol);

S2CPrizePoolResult.prototype.execute = function () {
    ClassicSlotMan.getInstance().onPrizePoolResult(this);
};

S2CPrizePoolResult.prototype.unmarshal = function (jsonObj) {
    LogicProtocol.prototype.unmarshal.call(this, jsonObj);
    this.rewards = jsonObj["rewards"];
    this.players = [];
    var playerArray = jsonObj["players"];
    if (playerArray) {
        for (var i = 0; i < playerArray.length; ++ i) {
            var prizePoolPlayer = new PrizePoolPlayer();
            prizePoolPlayer.unmarshal(playerArray[i]);
            this.players.push(prizePoolPlayer);
        }
    }
};

module.exports = S2CPrizePoolResult;