var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var HourlyGameMan = require("../../social/model/HourlyGameMan");
var HourlyGameCardData = require("../entity/HourlyGameCardData");
var HourlyGameCardReward = require("../entity/HourlyGameCardReward");

var S2CGetHourlyGame = function() {
    Protocol.call(this, ProtocolType.Social.S2C_GET_HOURLY_GAME);
    this.leftTime = 0;
    this.unclaimedChips = 0;
    this.unlockGems = 0;
    this.unlockColFriends = 0;
    /**
     * user own cards.
     * @type {Array.<HourlyGameCardData>}
     */
    this.cards = [];
    /**
     * unclaimed cards
     * @type {Array.<HourlyGameCardReward>}
     */
    this.unclaimedCards = [];
    this.unclaimedStars = 0;
    this.flipCardNum = 0;
};

Util.inherits(S2CGetHourlyGame, Protocol);

S2CGetHourlyGame.prototype.execute = function() {
    HourlyGameMan.getInstance().onGetHourlyGame(this);
};

S2CGetHourlyGame.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.leftTime = jsonObj["leftTime"];
    this.unclaimedChips = jsonObj["unclaimedChips"] || 0;
    this.unlockGems = jsonObj["unlockGems"] || 0;
    this.unlockColFriends = jsonObj["unlockColFriends"] || 0;
    this.unclaimedStars = jsonObj["unclaimedStars"] || 0;
    this.cards = jsonObj["cards"];

    var unclaimedCards = jsonObj["unclaimedCards"];
    for (var i = 0; i < unclaimedCards.length; ++i) {
        var hourlyGameCardReward = new HourlyGameCardReward();
        hourlyGameCardReward.unmarshal(unclaimedCards[i]);
        this.unclaimedCards.push(hourlyGameCardReward);
    }
    this.flipCardNum = jsonObj["flipCardNum"];
};

module.exports = S2CGetHourlyGame;