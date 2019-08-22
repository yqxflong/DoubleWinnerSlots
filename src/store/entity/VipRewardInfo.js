var VipRewardInfo = function() {
    this.rewardChips = 0;
    this.rewardGems = 0;
    this.rewardStars = 0;
    this.leftTime = 0;
    this.todayClaimed = false;
};

VipRewardInfo.prototype.unmarshal = function (jsonObj) {
    this.rewardChips = jsonObj["rewardChips"];
    this.rewardGems = jsonObj["rewardGems"];
    this.rewardStars = jsonObj["rewardStars"];
    this.leftTime = jsonObj["leftTime"];
    this.todayClaimed = jsonObj["todayClaimed"];
};

module.exports = VipRewardInfo;