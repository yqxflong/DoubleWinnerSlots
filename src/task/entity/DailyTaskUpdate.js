/**
 * Created by liuyue on 15-12-14.
 */
var DailyTaskUpdate = function() {
    this.taskType = 0;
    this.completeCount = 0;
    this.completed = false;
};

DailyTaskUpdate.prototype.unmarshal = function (jsonObj) {
    this.taskType = jsonObj["taskType"];
    this.completeCount = jsonObj["completeCount"];
    this.completed = jsonObj["completed"];
};

module.exports = DailyTaskUpdate;