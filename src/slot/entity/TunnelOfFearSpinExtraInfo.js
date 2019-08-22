var Util = require("../../common/util/Util");
var NormalSpinExtraInfo = require("./NormalSpinExtraInfo");
var Coordinate = require("./Coordinate");

var TunnelOfFearSpinExtraInfo = function () {
    NormalSpinExtraInfo.call(this);
    /**
     * @type {Array.<Coordinate>}
     */
    this.scatterWin = 0;
    //this.respinTimes = 0;
    this.lockedPos = [];
};

Util.inherits(TunnelOfFearSpinExtraInfo, NormalSpinExtraInfo);

TunnelOfFearSpinExtraInfo.prototype.unmarshal = function (jsonObj) {
    NormalSpinExtraInfo.prototype.unmarshal.call(this, jsonObj);

    this.scatterWin = jsonObj["scatterWin"];
    var lockedPos = jsonObj["lockedPos"];
    if (lockedPos) {
        for (var i = 0; i < lockedPos.length; ++i) {
            var coordiate = new Coordinate();
            coordiate.unmarshal(lockedPos[i]);
            this.lockedPos.push(coordiate);
        }
    }
};

module.exports = TunnelOfFearSpinExtraInfo;