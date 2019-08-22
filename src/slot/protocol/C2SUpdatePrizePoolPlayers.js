var Util = require("../../common/util/Util");
var ProtocolType = require("../../common/enum/ProtocolType");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ClassicSlotMan = require("../model/ClassicSlotMan");

/**
 * Created by alanmars on 15/5/13.
 */
var C2SUpdatePrizePoolPlayers = function() {
    LogicProtocol.call(this, ProtocolType.Slot.C2S_UPDATE_PRIZE_POOL_PLAYERS);
};

Util.inherits(C2SUpdatePrizePoolPlayers, LogicProtocol);

module.exports = C2SUpdatePrizePoolPlayers;