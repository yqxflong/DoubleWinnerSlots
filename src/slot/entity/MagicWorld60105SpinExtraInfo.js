var Util = require("../../common/util/Util");
var ScatterSpinExtraInfo = require("./ScatterSpinExtraInfo");

/**
 * Created by qinning on 15/10/26.
 */
var MagicWorld60105SpinExtraInfo = function () {
};

Util.inherits(MagicWorld60105SpinExtraInfo, ScatterSpinExtraInfo);

MagicWorld60105SpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    ScatterSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);
};

module.exports = MagicWorld60105SpinExtraInfo;