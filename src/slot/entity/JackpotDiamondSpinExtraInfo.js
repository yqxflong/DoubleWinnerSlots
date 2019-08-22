var Util = require("../../common/util/Util");
var SpinExtraInfo = require("./SpinExtraInfo");
var WinLineExtra = require("./WinLineExtra");

/**
 * Created by alanmars on 15/6/29.
 */
var JackpotDiamondSpinExtraInfo = function () {
    SpinExtraInfo.call(this);
    this.winLineExtras = [];
};

Util.inherits(JackpotDiamondSpinExtraInfo, SpinExtraInfo);

JackpotDiamondSpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    var winLineExtraArray = jsonObj["winLineExtras"];
    for (var i = 0; i < winLineExtraArray.length; ++ i) {
        var winLineExtra = new WinLineExtra();
        winLineExtra.unmarshal(winLineExtraArray[i]);
        this.winLineExtras.push(winLineExtra);
    }
};

module.exports = JackpotDiamondSpinExtraInfo;