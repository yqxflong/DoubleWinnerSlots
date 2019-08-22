var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");

var C2SGenHourlyGame = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_GEN_HOURLY_GAME);
    this.friendCount = 0;
};

Util.inherits(C2SGenHourlyGame, LogicProtocol);

module.exports = C2SGenHourlyGame;