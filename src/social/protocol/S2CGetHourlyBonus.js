var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var BonusMan = require("../../social/model/BonusMan");

/**
 * Created by alanmars on 15/5/7.
 */
var S2CGetHourlyBonus = function() {
    Protocol.call(this, ProtocolType.Social.S2C_GET_HOURLY_BONUS);
    this.leftTime = 0;
};

Util.inherits(S2CGetHourlyBonus, Protocol);

S2CGetHourlyBonus.prototype.execute = function() {
    BonusMan.getInstance().onGetHourlyBonus(this);
};

S2CGetHourlyBonus.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.leftTime = jsonObj["leftTime"];
};

module.exports = S2CGetHourlyBonus;