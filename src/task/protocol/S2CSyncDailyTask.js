var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var TaskMan = require("../model/TaskMan");
var DailyTaskUpdate = require("../entity/DailyTaskUpdate");

var S2CSyncDailyTask = function() {
    LogicProtocol.call(this, ProtocolType.Task.S2C_SYNC_DAILY_TASK);
    /**
     * @type {Array.<DailyTaskUpdate>}
     */
    this.syncDailyTasks = [];
    this.completed = false;
};

Util.inherits(S2CSyncDailyTask, LogicProtocol);

S2CSyncDailyTask.prototype.execute = function() {
    TaskMan.getInstance().onSyncDailyTasks(this);
};

S2CSyncDailyTask.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    var syncDailyTasks= jsonObj["syncDailyTasks"];
    for (var i = 0; i < syncDailyTasks.length; ++i) {
        var dailyTaskUpdate = new DailyTaskUpdate();
        dailyTaskUpdate.unmarshal(syncDailyTasks[i]);
        this.syncDailyTasks.push(dailyTaskUpdate);
    }
    this.completed = jsonObj["completed"];
};

module.exports = S2CSyncDailyTask;