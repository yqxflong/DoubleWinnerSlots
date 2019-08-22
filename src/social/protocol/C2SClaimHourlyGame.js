var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");

var C2SClaimHourlyGame = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_CLAIM_HOURLY_GAME);
};

Util.inherits(C2SClaimHourlyGame, LogicProtocol);

module.exports = C2SClaimHourlyGame;