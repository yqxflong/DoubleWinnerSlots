var WinOnFreeSpinTaskData = function(jsonObj) {
    this.totalWin = jsonObj["totalWin"] || 0;
    this.spinCount = jsonObj["spinCount"] || 0;
};

module.exports = WinOnFreeSpinTaskData;
