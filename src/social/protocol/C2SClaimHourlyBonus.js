var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");


/**
 * Created by alanmars on 15/5/7.
 */
var C2SClaimHourlyBonus = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_CLAIM_HOURLY_BONUS);
};

Util.inherits(C2SClaimHourlyBonus, LogicProtocol);

module.exports = C2SClaimHourlyBonus;