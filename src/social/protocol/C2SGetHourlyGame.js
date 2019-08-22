var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");

var C2SGetHourlyGame = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_GET_HOURLY_GAME);
};

Util.inherits(C2SGetHourlyGame, LogicProtocol);

module.exports = C2SGetHourlyGame;