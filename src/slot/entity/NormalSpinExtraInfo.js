/**
 * Created by alanmars on 15/4/16.
 */
var SpinExtraInfo = require("./SpinExtraInfo");
var Util = require("../../common/util/Util");
var BonusLine = require("./BonusLine");
var Coordinate = require("./Coordinate");

var NormalSpinExtraInfo = function(){
    /**
     * @type {Array.<BonusLine>}
     */
    this.bonusLines = [];
    /**
     * @type {Array.<Coordinate>}
     */
    this.scatters = [];
};

Util.inherits(NormalSpinExtraInfo,SpinExtraInfo);

NormalSpinExtraInfo.prototype.unmarshal = function(jsonObj) {
    SpinExtraInfo.prototype.unmarshal.call(this, jsonObj);
    var i;
    var bonusLineArray = jsonObj["bonusLines"];
    if (bonusLineArray) {
        for (i = 0; i < bonusLineArray.length; ++i) {
            var bonusLine = new BonusLine();
            bonusLine.unmarshal(bonusLineArray[i]);
            this.bonusLines.push(bonusLine);
        }
    }
    var scatterArray = jsonObj["scatters"];
    if (scatterArray != null) {
        for (i = 0; i < scatterArray.length; ++i) {
            var coord = new Coordinate();
            coord.unmarshal(scatterArray[i]);
            this.scatters.push(coord);
        }
    }
};

module.exports = NormalSpinExtraInfo;