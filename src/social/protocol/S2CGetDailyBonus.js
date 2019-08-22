var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var Currency = require("../../common/entity/Currency");
var BonusMan = require("../../social/model/BonusMan");

/**
 * Created by alanmars on 15/5/8.
 */
var S2CGetDailyBonus = function() {
    Protocol.call(this, ProtocolType.Social.S2C_GET_DAILY_BONUS);
    /**
     * Whether the daily bonus has been claimed today
     * @type {boolean}
     */
    this.todayClaimed = false;
    /**
     * @type {Array.<Currency>}
     */
    this.dailyBonusList = null;
    /**
     * @type {Currency}
     */
    this.baseBonus = null;

    this.continuousDayCount = 0;
    this.friendCount = 0;

    this.wheelBonus = 0;
    this.friendBonus = 0;
    this.loginBonus = 0;
};

Util.inherits(S2CGetDailyBonus, Protocol);

S2CGetDailyBonus.prototype.execute = function() {
    BonusMan.getInstance().onGetDailyBonus(this);
};

S2CGetDailyBonus.prototype.unmarshal = function(jsonObj) {
    if (!Protocol.prototype.unmarshal.call(this, jsonObj)) {
        return;
    }
    this.todayClaimed = jsonObj["todayClaimed"];
    if (!this.todayClaimed) {
        this.dailyBonusList = [];
        var bonusList = jsonObj["dailyBonusList"];
        for (var i = 0; i < bonusList.length; ++i) {
            var item = bonusList[i];
            this.dailyBonusList.push(new Currency(item));
        }
        this.baseBonus = new Currency(jsonObj["baseBonus"]);

        this.continuousDayCount = jsonObj["continuousDayCount"];
        this.friendCount = jsonObj["friendCount"];
        this.wheelBonus = jsonObj["wheelBonus"];
        this.friendBonus = jsonObj["friendBonus"];
        this.loginBonus = jsonObj["loginBonus"];
    }
};

module.exports = S2CGetDailyBonus;