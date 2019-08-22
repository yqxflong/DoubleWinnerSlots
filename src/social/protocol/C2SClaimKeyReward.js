var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");

var C2SClaimKeyReward = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_CLAIM_KEY_REWARD);
    this.rewardKey = null;
};

Util.inherits(C2SClaimKeyReward, LogicProtocol);

module.exports = C2SClaimKeyReward;