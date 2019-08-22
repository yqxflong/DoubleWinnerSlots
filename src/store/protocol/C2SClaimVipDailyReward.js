var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

var C2SClaimVipDailyReward = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_CLAIM_VIP_DAILY_REWARD);
};

Util.inherits(C2SClaimVipDailyReward, LogicProtocol);

module.exports = C2SClaimVipDailyReward;