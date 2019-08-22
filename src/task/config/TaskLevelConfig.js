var TaskReward = require("../entity/TaskReward");

var TaskLevelConfig = function() {
    this.level = 0;
    this.taskList = [];
    this.flagStonePos = cc.p(0, 0);
    this.flagStoneType = 0;
    this.isBranchTask = false;
    this.childrenLevel = [];
    this.levelStar = 0;
    this.needStar = 0;
    this.levelRewardList = [];
    this.showName = "";
};

TaskLevelConfig.prototype.unmarshal = function (jsonObj) {
    this.level = jsonObj["level"] || 0;
    var coordinate = jsonObj["coordinate"] || [0, 0];
    if(coordinate.length > 0) {
        this.flagStonePos = cc.p(coordinate[0], coordinate[1]);
    }
    this.flagStoneType = jsonObj["levelType"] || 1;
    var branchTask = jsonObj["isBranchTask"];
    if(branchTask == 1) this.isBranchTask = true;
    else this.isBranchTask = false;
    this.childrenLevel = jsonObj["children"] || [];
    this.levelStar = jsonObj["levelStar"] || 0;
    this.needStar = jsonObj["needStar"] || 0;
 
    this.levelRewardList.push(new TaskReward(jsonObj["reward1"]));
    this.levelRewardList.push(new TaskReward(jsonObj["reward2"]));
    this.levelRewardList.push(new TaskReward(jsonObj["reward3"]));

    this.showName = jsonObj["showName"] || "";
};

TaskLevelConfig.prototype.addTask = function (taskConfig) {
    if(taskConfig.taskLevelId == this.level) {
        this.taskList.push(taskConfig);
    }
};

TaskLevelConfig.prototype.clearTask = function () {
    this.taskList = [];
};

TaskLevelConfig.prototype.clearLevelStar = function () {
    this.levelStar = 0;
};

TaskLevelConfig.prototype.isTaskValild = function(taskId) {
    return this.taskList.indexOf(taskId) >= 0;
};

TaskLevelConfig.prototype.updateLevelConfig = function (levelConfig) {
    //this.taskList = levelConfig.taskList;
    this.levelStar = levelConfig.levelStar;
    //this.levelRewardList = levelConfig.levelRewardList;
    //this.flagStoneType = levelConfig.flagStoneType;
};

TaskLevelConfig.prototype.isCompleted = function () {
    return this.levelStar > 3;
};

module.exports = TaskLevelConfig;
