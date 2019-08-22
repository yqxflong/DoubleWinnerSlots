var Util = require("../../common/util/Util");
var ScatterSpinExtraInfo = require("./ScatterSpinExtraInfo");

/**
 * Created by qinning on 15/10/26.
 */
var MagicWorld60101SpinExtraInfo = function () {
    this.lockedIds = [];
};

Util.inherits(MagicWorld60101SpinExtraInfo, ScatterSpinExtraInfo);

MagicWorld60101SpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    ScatterSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);

    this.lockedIds = jsonObj["lockedIds"] || [];
};

module.exports = MagicWorld60101SpinExtraInfo;