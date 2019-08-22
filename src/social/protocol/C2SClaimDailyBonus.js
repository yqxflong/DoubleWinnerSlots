var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");

/**
 * Created by alanmars on 15/5/8.
 */
var C2SClaimDailyBonus = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_CLAIM_DAILY_BONUS);
};

Util.inherits(C2SClaimDailyBonus, LogicProtocol);

module.exports = C2SClaimDailyBonus;