/**
 * Created by alanmars on 15/5/28.
 */
SpinExtraInfo = require("./SpinExtraInfo");
Util = require("../../common/util/Util");

var ClassicLockSpinExtraInfo = function () {
    SpinExtraInfo.call(this);
    this.respinTimes = 0;
};

Util.inherits(ClassicLockSpinExtraInfo, SpinExtraInfo);

ClassicLockSpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    SpinExtraInfo.prototype.unmarshal.call(this, jsonObj);
    this.respinTimes = jsonObj["respinTimes"] || 0;
};

module.exports = ClassicLockSpinExtraInfo;