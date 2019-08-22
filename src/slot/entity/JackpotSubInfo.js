/**
 * Created by alanmars on 15/7/14.
 */
var JackpotSubInfo = function (jackpotType) {
    this.jackpotType = jackpotType;
};

JackpotSubInfo.prototype.unmarshal = function (jsonObj) {
    this.jackpotType = jsonObj["jackpotType"];
};

module.exports = JackpotSubInfo;