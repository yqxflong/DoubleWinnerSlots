var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var BonusMan = require("../../social/model/BonusMan");

/**
 * Created by alanmars on 15/5/8.
 */
var S2CClaimDailyBonus = function() {
    Protocol.call(this, ProtocolType.Social.S2C_CLAIM_DAILY_BONUS);
    this.errorCode = 0;
};

Util.inherits(S2CClaimDailyBonus, Protocol);

S2CClaimDailyBonus.prototype.execute = function() {
    BonusMan.getInstance().onClaimDailyBonus(this);
};

S2CClaimDailyBonus.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
};

module.exports = S2CClaimDailyBonus;