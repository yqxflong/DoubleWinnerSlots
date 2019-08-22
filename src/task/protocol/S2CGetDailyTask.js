var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var TaskMan = require("../model/TaskMan");
var DailyTaskInfo = require("../entity/DailyTaskInfo");
var DailyTaskReward = require("../entity/DailyTaskReward");

var S2CGetDailyTask = function() {
    LogicProtocol.call(this, ProtocolType.Task.S2C_GET_DAILY_TASK);
    this.taskList = []; //array of DailyTaskInfo
    this.dailyTaskReward = null; // type of DailyTaskReward
    this.rewardClaimed = false;
    this.completed = false;
    this.clearLeftTime = 0;
};

Util.inherits(S2CGetDailyTask, LogicProtocol);

S2CGetDailyTask.prototype.execute = function() {
    TaskMan.getInstance().onGetDailyTask(this);
};

S2CGetDailyTask.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    var taskList = jsonObj["taskList"];
    if (taskList) {
        for (var i = 0; i < taskList.length; ++i) {
            var dailyTaskInfo = new DailyTaskInfo();
            dailyTaskInfo.unmarshal(taskList[i]);
            this.taskList.push(dailyTaskInfo);
        }
    }

    var dailyTaskRewardStr = jsonObj["dailyTaskReward"];
    if (dailyTaskRewardStr) {
        this.dailyTaskReward = new DailyTaskReward();
        this.dailyTaskReward.unmarshal(dailyTaskRewardStr);
    }
    this.rewardClaimed = jsonObj["rewardClaimed"];
    this.completed = jsonObj["completed"];
    this.clearLeftTime = jsonObj["clearLeftTime"];
};


module.exports = S2CGetDailyTask;