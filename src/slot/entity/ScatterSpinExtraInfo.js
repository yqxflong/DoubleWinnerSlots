var SpinExtraInfo = require("./SpinExtraInfo");
var Util = require("../../common/util/Util");
var Coordinate = require("./Coordinate");

/**
 * Created by alanmars on 15/4/16.
 */
var ScatterSpinExtraInfo = function () {
    this.scatterCols = null;
    /**
     * @type {Array.<Coordinate>}
     */
    this.scatters = [];
};

Util.inherits(ScatterSpinExtraInfo, SpinExtraInfo);

ScatterSpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    SpinExtraInfo.prototype.unmarshal.call(this, jsonObj);
    this.scatterCols = jsonObj["scatterCols"] || [];
    var scatterArray = jsonObj["scatters"];
    if (scatterArray != null) {
        this.scatters = [];
        for (var i = 0; i < scatterArray.length; ++i) {
            var coord = new Coordinate();
            coord.unmarshal(scatterArray[i]);
            this.scatters.push(coord);
        }
    }
};

module.exports = ScatterSpinExtraInfo;