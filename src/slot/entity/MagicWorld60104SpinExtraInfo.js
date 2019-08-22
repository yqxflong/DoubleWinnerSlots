var Util = require("../../common/util/Util");
var ScatterSpinExtraInfo = require("./ScatterSpinExtraInfo");
var Coordinate = require("./Coordinate");
var MultipleWild = require("./MultipleWild");

/**
 * Created by qinning on 15/10/26.
 */
var MagicWorld60104SpinExtraInfo = function () {
    this.bonusWild = [];
    this.multipleWildList = [];
};

Util.inherits(MagicWorld60104SpinExtraInfo, ScatterSpinExtraInfo);

MagicWorld60104SpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    ScatterSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);

    var i = 0;
    this.bonusWild = [];
    var bonusWildArray = jsonObj["bonusWild"] || [];
    for(i = 0; i < bonusWildArray.length; i++) {
        var oneBonusWild = new Coordinate();
        oneBonusWild.unmarshal(bonusWildArray[i]);
        this.bonusWild.push(oneBonusWild);
    }

    this.multipleWildList = [];
    var multipleWildArray = jsonObj["multipleWild"] || [];
    for(i = 0; i < multipleWildArray.length; i++) {
        var oneMultipleWild = new MultipleWild();
        oneMultipleWild.unmarshal(multipleWildArray[i]);
        this.multipleWildList.push(oneMultipleWild);
    }
};

module.exports = MagicWorld60104SpinExtraInfo;