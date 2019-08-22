var Util = require("../../common/util/Util");
var ScatterSpinExtraInfo = require("./ScatterSpinExtraInfo");
var Coordinate = require("./Coordinate");

var VolcanoHellSpinExtraInfo = function () {
    ScatterSpinExtraInfo.call(this);
    this.scatterWin = 0;
    this.wildLines = [];
    this.nextScatterWin = 0;
};

Util.inherits(VolcanoHellSpinExtraInfo, ScatterSpinExtraInfo);

VolcanoHellSpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    ScatterSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);
    this.scatterWin = jsonObj["scatterWin"];
    this.nextScatterWin = jsonObj["nextScatterWin"];
    this.wildLines = jsonObj["wildLines"];
};

module.exports = VolcanoHellSpinExtraInfo;