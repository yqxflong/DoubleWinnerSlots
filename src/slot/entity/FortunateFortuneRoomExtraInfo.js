/**
 * Created by alanmars on 15/9/15.
 */
var FortunateFortuneRoomExtraInfo = function () {
    this.freeSpinMultiplier = 1;
};

FortunateFortuneRoomExtraInfo.prototype.unmarshal = function (jsonObj) {
    this.freeSpinMultiplier = jsonObj["freeSpinMultiplier"];
};

module.exports = FortunateFortuneRoomExtraInfo;