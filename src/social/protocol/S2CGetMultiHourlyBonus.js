var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var BonusMan = require("../../social/model/BonusMan");

/**
 * Created by alanmars on 15/5/7.
 */
var S2CGetMultiHourlyBonus = function() {
    Protocol.call(this, ProtocolType.Social.S2C_GET_MULTI_HOURLY_BONUS);
    /**
     * left time to claim hourly bonus
     * @type {number}
     */
    this.stage = 0; // 0, 1, 2, 3, 4
    this.leftTime = 0;
};

Util.inherits(S2CGetMultiHourlyBonus, Protocol);

S2CGetMultiHourlyBonus.prototype.execute = function() {
    BonusMan.getInstance().onGetMultiHourlyBonus(this);
};

S2CGetMultiHourlyBonus.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.stage = jsonObj["stage"];
    this.leftTime = jsonObj["leftTime"];
};

module.exports = S2CGetMultiHourlyBonus;