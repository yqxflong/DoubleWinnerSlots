var Util = require("../../common/util/Util");
var ScatterSpinExtraInfo = require("./ScatterSpinExtraInfo");

var GodsAndKingsSpinExtraInfo = function () {
    ScatterSpinExtraInfo.call(this);
    this.wildCols = null;
};

Util.inherits(GodsAndKingsSpinExtraInfo, ScatterSpinExtraInfo);

GodsAndKingsSpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    ScatterSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);
    this.wildCols = jsonObj["wildCols"];
};

module.exports = GodsAndKingsSpinExtraInfo;