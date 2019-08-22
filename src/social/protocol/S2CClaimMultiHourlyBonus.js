var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var BonusMan = require("../../social/model/BonusMan");

/**
 * Created by alanmars on 15/5/7.
 */
var S2CClaimMultiHourlyBonus = function() {
    Protocol.call(this, ProtocolType.Social.S2C_CLAIM_MULTI_HOURLY_BONUS);
    /**
     * hourly bonus
     * @type {number}
     */
    this.chipCount = 0;
    /**
     * next time to claim hourly bonus
     * @type {number}
     */
    this.nextLeftTime = 0;
};

Util.inherits(S2CClaimMultiHourlyBonus, Protocol);

S2CClaimMultiHourlyBonus.prototype.execute = function() {
    BonusMan.getInstance().onClaimMultiHourlyBonus(this);
};

S2CClaimMultiHourlyBonus.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.chipCount = jsonObj["chipCount"];
    this.nextLeftTime = jsonObj["nextLeftTime"];
};

module.exports = S2CClaimMultiHourlyBonus;