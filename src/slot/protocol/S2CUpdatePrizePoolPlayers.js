var Util = require("../../common/util/Util");
var ProtocolType = require("../../common/enum/ProtocolType");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var PrizePoolPlayer = require("../entity/PrizePoolPlayer");
var ClassicSlotMan = require("../model/ClassicSlotMan");

/**
 * Created by alanmars on 15/5/7.
 */
var S2CUpdatePrizePoolPlayers = function() {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_UPDATE_PRIZE_POOL_PLAYERS);
    /**
     * @type {number}
     */
    this.leftTime = 0;
    /**
     * @type {Array.<number>}
     */
    this.rewards = [];
    /**
     * @type {Array.<PrizePoolPlayer>}
     */
    this.players = null;
    /**
     * @type {number}
     */
    this.playerNum = 0;
};

Util.inherits(S2CUpdatePrizePoolPlayers, LogicProtocol);

S2CUpdatePrizePoolPlayers.prototype.execute = function() {
    ClassicSlotMan.getInstance().onGetPrizePool(this);
};

S2CUpdatePrizePoolPlayers.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this,jsonObj)){
        return;
    }
    this.players = [];
    var arr = jsonObj["players"];
    for(var i = 0; i < arr.length; ++i){
        var player = new PrizePoolPlayer();
        player.unmarshal(arr[i]);
        this.players.push(player);
    }
    this.rewards = jsonObj["rewards"];
    this.leftTime = jsonObj["leftTime"];
    this.playerNum = jsonObj["playerNum"];
};

module.exports = S2CUpdatePrizePoolPlayers;
