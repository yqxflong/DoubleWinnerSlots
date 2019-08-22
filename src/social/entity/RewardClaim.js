/**
 * Created by alanmars on 15/5/7.
 */
var RewardClaim = function() {
    this.errorCode = 0;
    this.id = 0;
    this.chipCount = 0;
    /**
     * ProductType
     * @type {number}
     */
    this.prodType = 0;
};

RewardClaim.prototype.unmarshal = function (jsonObj) {
    this.errorCode = jsonObj["errorCode"];
    this.id = jsonObj["id"];
    this.chipCount = jsonObj["chipCount"];
    this.prodType = jsonObj["prodType"];
};

module.exports = RewardClaim;