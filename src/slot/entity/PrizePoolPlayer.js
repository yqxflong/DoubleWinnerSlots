/**
 * Created by alanmars on 15/5/7.
 */
var PrizePoolPlayer = function() {
    this.playerId = 0;
    this.facebookId = null;
    this.rank = 0;
    this.score = 0;
};

PrizePoolPlayer.prototype = {
    constructor: PrizePoolPlayer,
    unmarshal: function(jsonObj) {
        this.playerId = jsonObj["playerId"];
        this.facebookId = jsonObj["facebookId"];
        this.rank = jsonObj["rank"];
        this.score = jsonObj["score"];
    }
};

module.exports = PrizePoolPlayer;