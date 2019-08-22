var JackpotSubInfo = require('./JackpotSubInfo');
var Util = require("../../common/util/Util");

var BetAccuJackpotSubInfo = function (jackpotType) {
    JackpotSubInfo.call(this, jackpotType);
    this.jackpotValue = 0;
    this.bets = [];
    this.taxRatios = [];
    this.rewardRatios = [];
};

Util.inherits(BetAccuJackpotSubInfo, JackpotSubInfo);

BetAccuJackpotSubInfo.prototype.unmarshal = function (jsonObj) {
    JackpotSubInfo.prototype.unmarshal.call(this, jsonObj);
    this.jackpotValue = jsonObj["jackpotValue"];
    this.bets = jsonObj["bets"];
    this.taxRatios = jsonObj["taxRatios"];
    this.rewardRatios = jsonObj["rewardRatios"];
};

module.exports = BetAccuJackpotSubInfo;