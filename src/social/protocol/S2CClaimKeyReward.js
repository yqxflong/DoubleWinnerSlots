var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var SocialMan = require("../../social/model/SocialMan");

var S2CClaimKeyReward = function() {
    Protocol.call(this, ProtocolType.Social.S2C_CLAIM_KEY_REWARD);
    this.chips = 0;
};

Util.inherits(S2CClaimKeyReward, Protocol);

S2CClaimKeyReward.prototype.execute = function() {
    SocialMan.getInstance().onClaimKeyReward(this);
};

S2CClaimKeyReward.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.chips = jsonObj["chips"];
};


module.exports = S2CClaimKeyReward;