var Util = require("../../common/util/Util");
var SpinExtraInfo = require("./SpinExtraInfo");
var Coordinate = require("./Coordinate");

/**
 * Created by qinning on 15/10/26.
 */
var WatersOfAtlantisSpinExtraInfo = function () {
    /**
     * @type {Array.<Coordinate>}
     */
    this.scatters = null;
    this.scatterWin = 0;
};

Util.inherits(WatersOfAtlantisSpinExtraInfo, SpinExtraInfo);

WatersOfAtlantisSpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    SpinExtraInfo.prototype.unmarshal.call(this, jsonObj);
    this.scatters = [];
    var scatterArray = jsonObj["scatters"];
    if (scatterArray != null) {
        for (var i = 0; i < scatterArray.length; ++i) {
            var coord = new Coordinate();
            coord.unmarshal(scatterArray[i]);
            this.scatters.push(coord);
        }
    }
    this.scatterWin = jsonObj["scatterWin"] || 0;
};

module.exports = WatersOfAtlantisSpinExtraInfo;