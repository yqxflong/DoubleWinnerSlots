var Reward = require("./Reward");

/**
 * Created by alanmars on 15/5/6.
 */
var RewardList = function() {
    /**
     * reward id => Reward
     * @type {object.<number, Reward>}
     */
    this.rewards = {};
};

RewardList.prototype.unmarshal = function(jsonObj) {
    var rewardsObj = jsonObj["rewards"];
    if (rewardsObj) {
        for (var rewardIdStr in rewardsObj) {
            var reward = new Reward();
            reward.unmarshal(rewardsObj[rewardIdStr]);
            this.rewards[rewardIdStr] = reward;
        }
    }
};

module.exports = RewardList;