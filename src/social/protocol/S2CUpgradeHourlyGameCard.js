var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var HourlyGameMan = require("../../social/model/HourlyGameMan");

var S2CUpgradeHourlyGameCard = function() {
    Protocol.call(this, ProtocolType.Social.S2C_UPGRADE_HOURLY_GAME_CARD);
    this.cardId = 0;
    this.newLevel = 0;
    this.costStars = 0;
    this.oldCardId = 0;
};

Util.inherits(S2CUpgradeHourlyGameCard, Protocol);

S2CUpgradeHourlyGameCard.prototype.execute = function() {
    HourlyGameMan.getInstance().onUpgradeHourlyGameCard(this);
};

S2CUpgradeHourlyGameCard.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.cardId = jsonObj["cardId"];
    this.newLevel = jsonObj["newLevel"];
    this.costStars = jsonObj["costStars"];
    this.oldCardId = jsonObj["oldCardId"];
};

module.exports = S2CUpgradeHourlyGameCard;