/**
 * Created by alanmars on 15/5/7.
 */
var PrizePoolRank = function(jsonObj) {
    this.playerId = jsonObj["playerId"];
    this.rank = jsonObj["rank"];
    this.playerNum = jsonObj["playerNum"];
};

module.exports = PrizePoolRank;