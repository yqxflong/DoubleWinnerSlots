var MagicWorld60106RoomExtraInfo = function () {
    this.currentGoal = 0;
    this.totalGoal = 0;
    this.goalCoin = 0;
};

MagicWorld60106RoomExtraInfo.prototype.unmarshal = function (jsonObj) {
    this.currentGoal = jsonObj["currentGoal"];
    this.totalGoal = jsonObj["totalGoal"];
    this.goalCoin = jsonObj["goalCoin"];
};

module.exports = MagicWorld60106RoomExtraInfo;