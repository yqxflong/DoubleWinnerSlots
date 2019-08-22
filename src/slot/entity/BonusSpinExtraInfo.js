/**
 * Created by alanmars on 15/4/16.
 */
var SpinExtraInfo = require("./SpinExtraInfo");
var Util = require("../../common/util/Util");

var BonusSpinExtraInfo = function(){
    this.bonusCols = null;
};

Util.inherits(BonusSpinExtraInfo, SpinExtraInfo);

BonusSpinExtraInfo.prototype.unmarshal = function(jsonObj) {
    SpinExtraInfo.prototype.unmarshal.call(this, jsonObj);
    this.bonusCols = jsonObj["bonusCols"] || [];
};

module.exports = BonusSpinExtraInfo;