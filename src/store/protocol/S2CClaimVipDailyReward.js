var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var StoreMan = require("../model/StoreMan");

var S2CClaimVipDailyReward = function() {
    LogicProtocol.call(this, ProtocolType.Social.S2C_CLAIM_VIP_DAILY_REWARD);
    this.errorCode = 0;
};

Util.inherits(S2CClaimVipDailyReward, LogicProtocol);

S2CClaimVipDailyReward.prototype.execute = function() {
    StoreMan.getInstance().onClaimVIPDailyReward(this);
};

S2CClaimVipDailyReward.prototype.unmarshal = function(jsonObj) {
    LogicProtocol.prototype.unmarshal.call(this,jsonObj);
};

module.exports = S2CClaimVipDailyReward;