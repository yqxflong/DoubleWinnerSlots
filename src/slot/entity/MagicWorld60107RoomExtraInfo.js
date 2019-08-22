var MagicWorld60107RoomExtraInfo = function () {
    this.maxWildCount = 0;
    this.wildCount = 0;
    this.goalCoin1 = 0;
    this.goalCoin2 = 0;
    this.goalCoin3 = 0;
};

MagicWorld60107RoomExtraInfo.prototype.unmarshal = function (jsonObj) {
    this.maxWildCount = jsonObj["maxWildCount"];
    this.wildCount = jsonObj["wildCount"];
    this.goalCoin1 = jsonObj["goalCoin1"];
    this.goalCoin2 = jsonObj["goalCoin2"];
    this.goalCoin3 = jsonObj["goalCoin3"];
};

module.exports = MagicWorld60107RoomExtraInfo;