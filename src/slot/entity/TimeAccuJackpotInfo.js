var JackpotInfo = require('./JackpotInfo');
var Util = require("../../common/util/Util");

var TimeAccuJackpotInfo = function () {
    JackpotInfo.call(this);
    this.jackpotValue = 0;
    this.incPerSec = 0;
    this.thresholdBet = 0;

    this.jackpotLevelRatioMap = null;
    this.rewardRatioMap = null;

    this.rewardBets = null;
    this.rewardRatios = null;
};

Util.inherits(TimeAccuJackpotInfo, JackpotInfo);

TimeAccuJackpotInfo.prototype.unmarshal = function (jsonObj) {
    JackpotInfo.prototype.unmarshal.call(this, jsonObj);
    this.jackpotValue = jsonObj["jackpotValue"];
    this.incPerSec = jsonObj["incPerSec"];
    this.thresholdBet = jsonObj["thresholdBet"];

    this.jackpotLevelRatioMap = jsonObj["jackpotLevelRatioMap"];
    this.rewardRatioMap = jsonObj["rewardRatioMap"];
    if (this.rewardRatioMap) {
        this.rewardBets = [];
        this.rewardRatios = [];
        var keys = Object.keys(this.rewardRatioMap);
        for (var i = 0; i < keys.length; ++ i) {
            this.rewardBets.push(parseInt(keys[i]));
            this.rewardRatios.push(this.rewardRatioMap[keys[i]]);
        }
    }
};

module.exports = TimeAccuJackpotInfo;