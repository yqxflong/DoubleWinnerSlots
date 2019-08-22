var Util = require("../../common/util/Util");
var ScatterSpinExtraInfo = require("./ScatterSpinExtraInfo");

/**
 * Created by qinning on 15/10/26.
 */
var MagicWorld60109SpinExtraInfo = function () {
    this.wildCols = [];
};

Util.inherits(MagicWorld60109SpinExtraInfo, ScatterSpinExtraInfo);

MagicWorld60109SpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    ScatterSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);

    this.wildCols = jsonObj["wildCols"] || [];
};

module.exports = MagicWorld60109SpinExtraInfo;