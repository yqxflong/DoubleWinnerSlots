/**
 * Created by ZenQhy on 16/6/21.
 */

var TaskRewardType = require("../enum/TaskRewardType");

var TaskReward = function(data) {
    this.coins = 0;
    this.gems = 0;
    this.stars = 0;

    if(data != null && !cc.isUndefined(data) && data.length >= 3) {
        this.coins = data[0];
        this.gems = data[1];
        this.stars = data[2];
    }

    this.twoRewardType = [];
    this.twoRewardValue = [];

    if(this.coins > 0) {
        this.twoRewardType.push(TaskRewardType.REWARD_COINS);
        this.twoRewardValue.push(this.coins);
    }

    if(this.gems > 0) {
        this.twoRewardType.push(TaskRewardType.REWARD_GEMS);
        this.twoRewardValue.push(this.gems);
    }

    if(this.stars > 0 && this.twoRewardType.length < 2) {
        this.twoRewardType.push(TaskRewardType.REWARD_STAR);
        this.twoRewardValue.push(this.stars);
    }
};

TaskReward.prototype.getTwoRewardType = function () {
    return this.twoRewardType;
};

TaskReward.prototype.getTwoRewardValue = function () {
    return this.twoRewardValue;
};

module.exports = TaskReward;