var JackpotInfo = require('./JackpotInfo');
var Util = require("../../common/util/Util");

var BetAccuJackpotInfo = function () {
    JackpotInfo.call(this);
    this.jackpotValue = 0;
    this.jackpotLevel = 0;
    this.minSingleBet = 0;
};

Util.inherits(BetAccuJackpotInfo, JackpotInfo);

BetAccuJackpotInfo.prototype.unmarshal = function (jsonObj) {
    JackpotInfo.prototype.unmarshal.call(this, jsonObj);
    this.jackpotValue = jsonObj["jackpotValue"];
    this.jackpotLevel = jsonObj["jackpotLevel"];
    this.minSingleBet = jsonObj["minSingleBet"];
};

module.exports = BetAccuJackpotInfo;