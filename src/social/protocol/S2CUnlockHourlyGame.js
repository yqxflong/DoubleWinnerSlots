var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var HourlyGameMan = require("../../social/model/HourlyGameMan");

var S2CUnlockHourlyGame = function() {
    Protocol.call(this, ProtocolType.Social.S2C_UNLOCK_HOURLY_GAME);
    this.costGems = 0;
};

Util.inherits(S2CUnlockHourlyGame, Protocol);

S2CUnlockHourlyGame.prototype.execute = function() {
    HourlyGameMan.getInstance().onUnlockHourlyGame(this);
};

S2CUnlockHourlyGame.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.costGems = jsonObj["costGems"];
};

module.exports = S2CUnlockHourlyGame;