/**
 * Created by qinning on 16/1/4.
 */

var HourlyGameCollectData = function () {
    this.id = 0;
    /**
     * @type {HourlyGameCardConfigData}
     */
    this.cardConfigData = null;
    this.level = 0;
    this.chips = 0;
    this.num = 0;
};

/**
 * @param {HourlyGameCardConfigData} cardConfigData
 * @param {HourlyGameCardData} cardData
 */
HourlyGameCollectData.prototype.initWithCardInfo = function (cardConfigData) {
    if (!cardConfigData) {
        throw new Error("card config data is null");
    }
    this.id = cardConfigData.id;
    this.cardConfigData = cardConfigData;
};

/**
 * @param {HourlyGameCardReward} cardRewardData
 */
HourlyGameCollectData.prototype.updateWithCardData = function (cardRewardData) {
    this.chips += cardRewardData.chips;
    this.num++;
};

module.exports = HourlyGameCollectData;