/**
 * Created by alanmars on 15/5/6.
 */
var Reward = function() {
    this.id = 0;
    this.type = 0;
    this.chipCount = 0;
    this.rewardTime = 0;
    this.rewardData = null;
    /**
     * @type {ProductType}
     */
    this.prodType = 0;
};

Reward.prototype.unmarshal = function(jsonObj) {
    this.id = jsonObj["id"];
    this.type = jsonObj["type"];
    this.chipCount = jsonObj["chipCount"];
    this.rewardData = jsonObj["rewardData"];
    this.prodType = jsonObj["prodType"];
};

module.exports = Reward;