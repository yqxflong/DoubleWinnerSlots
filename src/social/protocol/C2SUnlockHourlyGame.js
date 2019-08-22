var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");

var C2SUnlockHourlyGame = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_UNLOCK_HOURLY_GAME);
};

Util.inherits(C2SUnlockHourlyGame, LogicProtocol);

module.exports = C2SUnlockHourlyGame;