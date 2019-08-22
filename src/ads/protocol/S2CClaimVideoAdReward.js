var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var AdControl = require("../entity/AdControl");
var SocialMan = require("../../social/model/SocialMan");

/**
 * Created by qinning on 16/5/10.
 */
var S2CClaimVideoAdReward = function() {
    LogicProtocol.call(this, ProtocolType.Social.S2C_CLAIM_VIDEO_AD_REWARD);
    this.chips = 0;
};

Util.inherits(S2CClaimVideoAdReward, LogicProtocol);

S2CClaimVideoAdReward.prototype.execute = function() {
    SocialMan.getInstance().onClaimVideoAdReward(this);
};

S2CClaimVideoAdReward.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this, jsonObj)) {
        return;
    }
    this.chips = jsonObj["chips"];
};

module.exports = S2CClaimVideoAdReward;