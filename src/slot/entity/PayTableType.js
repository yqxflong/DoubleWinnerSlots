/**
 * Created by qinning on 15/6/26.
 */
var BonusSpinExtraInfo = require("./BonusSpinExtraInfo");
var Util = require("../../common/util/Util");
var PickResult = require("./PickResult");

var BonusAward = function(){
    this.awardType = 0;
    this.awardValue = 0;
};

Util.inherits(BonusAward, BonusSpinExtraInfo);

BonusAward.prototype.unmarshal = function(jsonObj) {
    this.awardType = jsonObj["awardType"];
    this.awardValue = jsonObj["awardValue"];
};

module.exports = BonusAward;