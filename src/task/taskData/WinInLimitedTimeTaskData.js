var WinInLimitedTimeTaskData = function(jsonObj) {
    this.envokeTime = jsonObj["envokeTime"] || 0;
    this.totalWin = jsonObj["totalWin"] || 0;
    this.lastSpinTime = jsonObj["lastSpinTime"] || 0;
    this.needRefresh = jsonObj["needRefresh"] || false;
};

module.exports = WinInLimitedTimeTaskData;
