var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var HourlyGameMan = require("../../social/model/HourlyGameMan");
var HourlyGameCardReward = require("../entity/HourlyGameCardReward");

var S2CGenHourlyGame = function() {
    Protocol.call(this, ProtocolType.Social.S2C_GEN_HOURLY_GAME);
    /**
     * @type {Array.<HourlyGameCardReward>}
     */
    this.cards = [];
    this.rewardStars = 0;
    this.leftTime = 0;
    this.flipCardNum = 0;
};

Util.inherits(S2CGenHourlyGame, Protocol);

S2CGenHourlyGame.prototype.execute = function() {
    HourlyGameMan.getInstance().onGenHourlyGame(this);
};

S2CGenHourlyGame.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this, jsonObj)) {
        return;
    }
    var cards = jsonObj["cards"];
    for (var i = 0; i < cards.length; ++i) {
        var hourlyGameCardReward = new HourlyGameCardReward();
        hourlyGameCardReward.unmarshal(cards[i]);
        this.cards.push(hourlyGameCardReward);
    }
    this.rewardStars = jsonObj["rewardStars"];
    this.flipCardNum = jsonObj["flipCardNum"];
};

module.exports = S2CGenHourlyGame;