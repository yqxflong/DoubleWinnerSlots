var VolcanoHellRoomExtraInfo = function () {
    this.nextScatterWin = 0;
};

VolcanoHellRoomExtraInfo.prototype.unmarshal = function (jsonObj) {
    this.nextScatterWin = jsonObj["nextScatterWin"];
};

module.exports = VolcanoHellRoomExtraInfo;