var BasePlayer = require("../../common/entity/BasePlayer");

/**
 * Created by alanmars on 15/7/21.
 */
var JackpotRecord = function () {
    /**
     * @type {Player}
     */
    this.winner = null;
    this.winChips = 0;
    this.subjectId = 0;
    this.jackpotId = 0;
    this.triggerTime = 0;
};

JackpotRecord.prototype.unmarshal = function (jsonObj) {
    this.winner = new BasePlayer();
    this.winner.unmarshal(jsonObj["winner"]);
    this.winChips = jsonObj["winChips"];
    this.subjectId = jsonObj["subjectId"];
    this.jackpotId = jsonObj["jackpotId"];
    this.triggerTime = jsonObj["triggerTime"];
};

module.exports = JackpotRecord;