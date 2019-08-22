/**
 * Created by alanmars on 15/4/22.
 * @param jsonObj
 */
var LevelExp = function() {
    this.level = 0;
    this.exp = 0;
    this.isLevelUp = false;
    this.levelUpExp = 0;
    this.rewardVipPoints = 0;
    this.rewardChips = 0;
};

LevelExp.prototype.unmarshal = function(jsonObj) {
    this.level = jsonObj["level"];
    this.exp = jsonObj["exp"];
    this.isLevelUp = jsonObj["isLevelUp"];
    this.levelUpExp = jsonObj["levelUpExp"];
    this.rewardVipPoints = jsonObj["rewardVipPoints"];
    this.rewardChips = jsonObj["rewardChips"];
};

module.exports = LevelExp;