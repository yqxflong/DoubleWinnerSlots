/**
 * Created by alanmars on 15/4/15.
 */
var LevelMaxBet = function() {
    this.level = 0;
    this.maxBet = 0;
};

LevelMaxBet.prototype = {
    constructor: LevelMaxBet,
    unmarshal: function(jsonObj) {
        this.level = jsonObj["level"];
        this.maxBet = jsonObj["maxBet"];
    }
};

module.exports = LevelMaxBet;