var HourlyGameCardReward = function(jsonObj) {
    this.id = 0;
    this.chips = 0;
};

HourlyGameCardReward.prototype.unmarshal = function (jsonObj) {
    this.id = jsonObj["id"];
    this.chips = jsonObj["chips"];
};

module.exports = HourlyGameCardReward;