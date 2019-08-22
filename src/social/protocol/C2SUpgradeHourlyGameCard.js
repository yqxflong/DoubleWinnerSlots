var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");

var C2SUpgradeHourlyGameCard = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_UPGRADE_HOURLY_GAME_CARD);
    this.cardId = 0;
};

Util.inherits(C2SUpgradeHourlyGameCard, LogicProtocol);

module.exports = C2SUpgradeHourlyGameCard;