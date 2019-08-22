var TaskConfig = require("../config/TaskConfig");

var TaskLevelUp = function() {
    this.newTaskLevel = 0;
    this.oldTaskLevel = 0;
    /**
     * @type {Array.<TaskConfig>}
     */
    this.newTaskConfigs = [];
    this.rewardChips = 0;
    this.rewardGems = 0;
    this.rewardStars = 0;
    this.newSubjects = [];
    this.newCards = [];
    this.taskStarNum = 0;
};

TaskLevelUp.prototype.unmarshal = function (jsonObj) {
    this.newTaskLevel = jsonObj["newTaskLevel"];
    this.oldTaskLevel = jsonObj["oldTaskLevel"];
    var newTaskConfigs = jsonObj["newTaskConfigs"];
    for (var i = 0; i < newTaskConfigs.length; ++i) {
        var taskConfig = new TaskConfig(newTaskConfigs[i]);
        this.newTaskConfigs.push(taskConfig);
    }
    this.rewardChips = jsonObj["rewardChips"];
    this.rewardGems = jsonObj["rewardGems"];
    this.rewardStars = jsonObj["rewardStars"];
    this.newSubjects = jsonObj["newSubjects"];
    this.newCards = jsonObj["newCards"];
    this.taskStarNum = jsonObj["taskStarNum"];
};

module.exports = TaskLevelUp;