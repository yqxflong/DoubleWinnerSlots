var ConsecutiveWinTaskData = function(jsonObj) {
    this.consecutiveWinCount = jsonObj["consecutiveWinCount"] || 0;
    this.maxConsecutiveWin = jsonObj["maxConsecutiveWin"] || 0;
};

module.exports = ConsecutiveWinTaskData;
