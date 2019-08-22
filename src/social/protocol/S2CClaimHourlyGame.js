var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var HourlyGameMan = require("../../social/model/HourlyGameMan");

var S2CClaimHourlyGame = function() {
    Protocol.call(this, ProtocolType.Social.S2C_CLAIM_HOURLY_GAME);
    this.totalChips = 0;
    this.rewardStars = 0;
    this.leftTime = 0;
};

Util.inherits(S2CClaimHourlyGame, Protocol);

S2CClaimHourlyGame.prototype.execute = function() {
    HourlyGameMan.getInstance().onClaimHourlyGame(this);
};

S2CClaimHourlyGame.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.totalChips = jsonObj["totalChips"];
    this.rewardStars = jsonObj["rewardStars"];
    this.leftTime = jsonObj["leftTime"];
};

module.exports = S2CClaimHourlyGame;