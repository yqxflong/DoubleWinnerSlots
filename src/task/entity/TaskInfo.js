/**
 * Created by qinning on 15/12/4.
 */
var TaskTypeFactory = require("../../task/taskEntity/TaskTypeFactory");
var TaskInfo = function () {
    this.taskId = 0;
    this.taskType = 0;
    this.taskData = null;
};

TaskInfo.prototype.unmarshal = function (jsonObj) {
    this.taskId = jsonObj["taskId"];
    this.taskType = jsonObj["taskType"];
    this.taskData = TaskTypeFactory.create(jsonObj);
};

module.exports = TaskInfo;