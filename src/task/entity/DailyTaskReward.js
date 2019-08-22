/**
 * Created by liuyue on 15-12-14.
 */

var DailyTaskReward = function() {
    this.minFinishCount = 0;
    this.rewardChips = 0;
    this.rewardGems = 0;
    this.rewardStars = 0;
};

DailyTaskReward.prototype.unmarshal = function (jsonObj) {
    this.minFinishCount = jsonObj["minFinishCount"];
    this.rewardChips = jsonObj["rewardChips"];
    this.rewardGems = jsonObj["rewardGems"];
    this.rewardStars = jsonObj["rewardStars"];
};

module.exports = DailyTaskReward;
