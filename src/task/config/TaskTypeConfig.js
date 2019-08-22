/**
 * Created by qinning on 16/1/13.
 */

var TaskTypeConfig = function() {
    this.task_type = 0;
    this.iconName = "";
};

TaskTypeConfig.prototype.unmarshal = function (jsonObj) {
    this.task_type = jsonObj["task_type"];
    this.iconName = jsonObj["iconName"];
};

module.exports = TaskTypeConfig;