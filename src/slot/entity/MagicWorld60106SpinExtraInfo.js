var Util = require("../../common/util/Util");
var ScatterSpinExtraInfo = require("./ScatterSpinExtraInfo");

/**
 * Created by qinning on 15/10/26.
 */
var MagicWorld60106SpinExtraInfo = function () {
    this.currentGoal = 0;
    this.goalCoin = 0;
};

Util.inherits(MagicWorld60106SpinExtraInfo, ScatterSpinExtraInfo);

MagicWorld60106SpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    ScatterSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);

    this.currentGoal = jsonObj["currentGoal"];
    this.goalCoin = jsonObj["goalCoin"];
};

module.exports = MagicWorld60106SpinExtraInfo;