var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var TaskMan = require("../model/TaskMan");
var TaskLevelUp = require("../entity/TaskLevelUp");

var S2CCompleteTask = function() {
    LogicProtocol.call(this, ProtocolType.Task.S2C_COMPLETE_TASK);
    this.errorCode = 0;
    /**
     * @type {TaskLevelUp}
     */
    this.taskLevelUp = null;
};

Util.inherits(S2CCompleteTask, LogicProtocol);

S2CCompleteTask.prototype.execute = function() {
    TaskMan.getInstance().onCompletedTask(this);
};

S2CCompleteTask.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.taskLevelUp = new TaskLevelUp();
    if (jsonObj["taskLevelUp"]) {
        this.taskLevelUp.unmarshal(jsonObj["taskLevelUp"]);
    }
};

module.exports = S2CCompleteTask;