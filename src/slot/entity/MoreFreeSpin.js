var Coordinate = require("./Coordinate");

var MoreFreeSpin = function() {
    this.freeSpinCount = 0;
    this.coordinate = null;
};

MoreFreeSpin.prototype.unmarshal = function (jsonObj) {
    this.freeSpinCount = jsonObj["freeSpinCount"];
    this.coordinate = new Coordinate();
    this.coordinate.unmarshal(jsonObj["coordinate"]);
};

module.exports = MoreFreeSpin;