var DailyTaskConfig = function(jsonObj) {
    this.taskType = jsonObj["task_type"] || 0;
    this.desc = jsonObj["desc"] || "";
    this.param1 = jsonObj["param1"];
    this.iconName = jsonObj["iconName"];
};

module.exports = DailyTaskConfig;
