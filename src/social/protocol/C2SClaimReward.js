var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

/**
 * Created by alanmars on 15/5/7.
 */
var C2SClaimReward = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_CLAIM_REWARD);
    /**
     * @type {Array.<number>}
     */
    this.rewardIdList = null;
};

Util.inherits(C2SClaimReward, LogicProtocol);

module.exports = C2SClaimReward;