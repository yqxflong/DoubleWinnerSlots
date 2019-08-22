var Util = require("../../common/util/Util");
var ScatterSpinExtraInfo = require("./ScatterSpinExtraInfo");
var MoreFreeSpin = require("./MoreFreeSpin");
var Coordinate = require("./Coordinate");

/**
 * Created by qinning on 15/10/26.
 */
var MagicWorld60110SpinExtraInfo = function () {
    this.wildArray = [];
    this.bonusPos = [];
    this.bonusPay = 0;
    this.otherBonusPay = [];
    this.moreFreeSpin = [];
};

Util.inherits(MagicWorld60110SpinExtraInfo, ScatterSpinExtraInfo);

MagicWorld60110SpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    ScatterSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);

    var i = 0;
    var wildArrayData = jsonObj["wildArray"] || [];
    for(i = 0; i < wildArrayData.length; i++) {
        var oneWildArray = new Coordinate();
        oneWildArray.unmarshal(wildArrayData[i]);
        this.wildArray.push(oneWildArray);
    }

    var bonusPosArray = jsonObj["bonusPos"] || [];
    for(i = 0; i < bonusPosArray.length; i++) {
        var oneBonusPos = new Coordinate();
        oneBonusPos.unmarshal(bonusPosArray[i]);
        this.bonusPos.push(oneBonusPos);
    }

    this.bonusPay = jsonObj["bonusPay"];
    this.otherBonusPay = jsonObj["otherBonusPay"] || [];

    var moreFreeSpinArray = jsonObj["moreFreeSpin"] || [];
    for(i = 0; i < moreFreeSpinArray.length; i++) {
        var oneMoreFreeSpin = new MoreFreeSpin();
        oneMoreFreeSpin.unmarshal(moreFreeSpinArray[i]);
        this.moreFreeSpin.push(oneMoreFreeSpin);
    }
};

module.exports = MagicWorld60110SpinExtraInfo;