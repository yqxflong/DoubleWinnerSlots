var HourlyGameCardLevelConfigData = require("./HourlyGameCardLevelConfigData");
var HourlyGameCardType = require("../enum/HourlyGameCardType");

var HourlyGameCardConfigData = function() {
    this.id = 0;
    this.name = "";
    this.type = 0;
    this.cardName = "";
    this.level = 0;
    this.starsNeed = 0;
    this.bonus = 0;
};

HourlyGameCardConfigData.prototype.unmarshal = function(jsonObj) {
    this.id = jsonObj["id"];
    this.name = jsonObj["name"];
    this.type = jsonObj["type"];
    this.cardName = jsonObj["cardname"];
    this.level = jsonObj["level"];
    this.starsNeed = jsonObj["starsNeed"];
    this.cardGroupId = jsonObj["cardGroupId"];
    this.bonus = jsonObj["bonus"];
    this.nextLevelId = jsonObj["nextLevelId"];
};

HourlyGameCardConfigData.prototype.getCardName = function (isSmallCard) {
    if (isSmallCard) {
        return this.cardName + "_s.png";
    } else {
        return "casino/card/" + this.cardName + ".png";
    }
};

module.exports = HourlyGameCardConfigData;