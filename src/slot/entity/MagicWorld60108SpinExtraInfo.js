var Util = require("../../common/util/Util");
var ScatterSpinExtraInfo = require("./ScatterSpinExtraInfo");

/**
 * Created by qinning on 15/10/26.
 */
var MagicWorld60108SpinExtraInfo = function () {
};

Util.inherits(MagicWorld60108SpinExtraInfo, ScatterSpinExtraInfo);

MagicWorld60108SpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    ScatterSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);
};

module.exports = MagicWorld60108SpinExtraInfo;