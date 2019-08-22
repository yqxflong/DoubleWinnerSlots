var Util = require("../../common/util/Util");
var NormalSpinExtraInfo = require("./NormalSpinExtraInfo");

/**
 * Created by alanmars on 15/9/14.
 */
var FortunateFortuneSpinExtraInfo = function () {
    NormalSpinExtraInfo.call(this);
    this.freeSpinMultiplier = 1;
};

Util.inherits(FortunateFortuneSpinExtraInfo, NormalSpinExtraInfo);

FortunateFortuneSpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    NormalSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);
    this.freeSpinMultiplier = jsonObj["freeSpinMultiplier"] || 1;
};

module.exports = FortunateFortuneSpinExtraInfo;