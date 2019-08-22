/**
 * Created by liuyue on 15-12-14.
 */
var DailyTaskInfo = function() {
    this.taskType = 0;
    this.needCount = 0;
    this.completeCount = 0;
    this.taskId = 0;
};

DailyTaskInfo.prototype.unmarshal = function (jsonObj) {
    this.taskType = jsonObj["taskType"];
    this.needCount = jsonObj["needCount"];
    this.completeCount = jsonObj["completeCount"];
    this.taskId = jsonObj["taskId"];
};

DailyTaskInfo.prototype.isCompleted = function () {
    if (this.completeCount >= this.needCount) {
        return true;
    }
    return false;
};

/**
 * @param {DailyTaskUpdate} dailyTaskUpdate
 */
DailyTaskInfo.prototype.updateTask = function (dailyTaskUpdate) {
    if (dailyTaskUpdate.taskType == this.taskType) {
        this.completeCount = dailyTaskUpdate.completeCount;
    } else {
        throw new Error("updateTask failed. taskType not equal.");
    }
};

module.exports = DailyTaskInfo;