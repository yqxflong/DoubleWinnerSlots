var HourlyGameCardData = function() {
    this.id = 0;
    this.level = 0;
};

HourlyGameCardData.prototype.unmarshal = function (jsonObj) {
    this.id = jsonObj["id"];
    this.level = jsonObj["level"];
};

HourlyGameCardData.createDefault = function (cardId) {
    var gameCardData = new HourlyGameCardData();
    gameCardData.id = cardId;
    gameCardData.level = 1;
    return gameCardData;
};

module.exports = HourlyGameCardData;