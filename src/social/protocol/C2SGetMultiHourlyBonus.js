var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");

var C2SGetMultiHourlyBonus = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_GET_MULTI_HOURLY_BONUS);
};

Util.inherits(C2SGetMultiHourlyBonus, LogicProtocol);

module.exports = C2SGetMultiHourlyBonus;