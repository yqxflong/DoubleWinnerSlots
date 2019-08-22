/**
 * Created by qinning on 15/7/2.
 */
var ONE_HOUR_MILLION_SECONDS = 60 * 60 * 1000;
var ServerConfig = function() {
    this.fbInviteReward = 0;
    this.multiHourlyBonusInterval = 0;
    this.bindFacebookReward = 0;
    this.bindEmailReward = 0;
    this.likeUsReward = 0;
};

ServerConfig.prototype.unmarshal = function(jsonObj) {
    this.fbInviteReward = jsonObj["fbInviteReward"];
    if (cc.isUndefined(jsonObj["multiHourlyBonusInterval"])) {
        this.multiHourlyBonusInterval = ONE_HOUR_MILLION_SECONDS;
    } else {
        this.multiHourlyBonusInterval = jsonObj["multiHourlyBonusInterval"];
    }
    this.bindFacebookReward = jsonObj["bindFacebookReward"];
    this.bindEmailReward = jsonObj["bindEmailReward"];
    this.likeUsReward = jsonObj["likeUsReward"];
};

module.exports = ServerConfig;