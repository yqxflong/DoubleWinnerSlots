var Util = require("../../common/util/Util");
var Protocol = require("../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var RewardClaim = require("../entity/RewardClaim");
var SocialMan = require("../model/SocialMan");

/**
 * Created by alanmars on 15/5/7.
 */
var S2CClaimReward = function() {
    Protocol.call(this, ProtocolType.Social.S2C_CLAIM_REWARD);
    /**
     * @type {Array.<RewardClaim>}
     */
    this.rewardClaimList = [];
};

Util.inherits(S2CClaimReward, Protocol);

S2CClaimReward.prototype.execute = function() {
    SocialMan.getInstance().onClaimReward(this);
};

S2CClaimReward.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    var claimArray = jsonObj["rewardClaimList"];
    if (claimArray) {
        for (var i = 0; i < claimArray.length; ++ i) {
            var rewardClaim = new RewardClaim();
            rewardClaim.unmarshal(claimArray[i]);
            this.rewardClaimList.push(rewardClaim);
        }
    }
};

module.exports = S2CClaimReward;