/**
 * Created by alanmars on 15/5/18.
 */
var RewardAdConfig = function() {
    this.showAd = true;
    this.level = 10;
    this.reward = 30000;
    this.maxTimes = 5;
    this.interval = 0;
    this.purchaseShow = false;
};

RewardAdConfig.prototype.unmarshal = function(jsonObj) {
    this.showAd = jsonObj["showAd"];
    this.level = jsonObj["level"];
    this.reward = jsonObj["reward"];
    this.maxTimes = jsonObj["maxTimes"];
    this.interval = jsonObj["interval"];
    this.purchaseShow = jsonObj["purchaseShow"];
};
module.exports = RewardAdConfig;