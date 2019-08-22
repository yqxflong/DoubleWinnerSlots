/**
 * Created by alanmars on 15/7/14.
 */
var JackpotInfo = function () {
    this.jackpotId = 0;
    this.jackpotType = 0;
};

JackpotInfo.prototype.unmarshal = function (jsonObj) {
    this.jackpotId = jsonObj["jackpotId"];
    this.jackpotType = jsonObj["jackpotType"];
};

module.exports = JackpotInfo;