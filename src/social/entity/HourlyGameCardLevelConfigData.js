/**
 * Created by qinning on 16/1/4.
 */

var HourlyGameCardLevelConfigData = function(jsonObj) {
    this.starsNeed = jsonObj["starsNeed"];
    this.bonus = jsonObj["bonus"];
    this.cardName = jsonObj["cardName"];
};

HourlyGameCardLevelConfigData.prototype.getCardName = function (isSmallCard) {
    if (isSmallCard) {
        return this.cardName + "_s.jpg";
    } else {
        return "casino/card/" + this.cardName + ".jpg";
    }
};

module.exports = HourlyGameCardLevelConfigData;