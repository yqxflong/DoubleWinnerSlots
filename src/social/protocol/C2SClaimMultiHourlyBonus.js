var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");

var C2SClaimMultiHourlyBonus = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_CLAIM_MULTI_HOURLY_BONUS);
};

Util.inherits(C2SClaimMultiHourlyBonus, LogicProtocol);

module.exports = C2SClaimMultiHourlyBonus;