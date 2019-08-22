var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

/**
 * Created by qinning on 16/5/10.
 */
var C2SClaimVideoAdReward = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_CLAIM_VIDEO_AD_REWARD);
};

Util.inherits(C2SClaimVideoAdReward, LogicProtocol);

module.exports = C2SClaimVideoAdReward;