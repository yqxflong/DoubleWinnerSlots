var Coordinate = require("./Coordinate");

var RevealBonusInfo = function() {
    this.pos = null;
    this.symbolId = 0;
};

RevealBonusInfo.prototype.unmarshal = function (jsonObj) {
    this.pos = new Coordinate();
    this.pos.unmarshal(jsonObj["pos"]);
    this.symbolId = jsonObj["symbolId"];
};

module.exports = RevealBonusInfo;