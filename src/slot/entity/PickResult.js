/**
 * Created by qinning on 15/6/26.
 */
var BonusSpinExtraInfo = require("./BonusSpinExtraInfo");
var Util = require("../../common/util/Util");

var PickResult = function(){
    this.win = 0;
    this.options = null;
    this.picl = 0;
};

Util.inherits(PickResult, BonusSpinExtraInfo);

PickResult.prototype.unmarshal = function(jsonObj) {
    this.win = jsonObj["win"];
    this.options = jsonObj["options"];
    this.pick = jsonObj["pick"];
};

module.exports = PickResult;