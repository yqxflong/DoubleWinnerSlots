var Util = require("../../common/util/Util");
var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var SocialMan = require("../model/SocialMan");
var RewardList = require("../entity/RewardList");

/**
 * Created by alanmars on 15/5/7.
 */
var S2CRewardNotice = function() {
    Protocol.call(this, ProtocolType.Social.S2C_REWARD_NOTICE);
    this.rewardList = null;
};

Util.inherits(S2CRewardNotice, Protocol);

S2CRewardNotice.prototype.execute = function() {
    SocialMan.getInstance().onRewardNotice(this);
};

S2CRewardNotice.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.rewardList = new RewardList();
    this.rewardList.unmarshal(jsonObj["rewardList"]);
};

module.exports = S2CRewardNotice;