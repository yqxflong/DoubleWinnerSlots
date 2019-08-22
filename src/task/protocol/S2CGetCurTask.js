var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var TaskMan = require("../model/TaskMan");
var TaskConfig = require("../config/TaskConfig");

var S2CGetCurTask = function() {
    LogicProtocol.call(this, ProtocolType.Task.S2C_GET_CUR_TASK);
    this.taskLevel = 0;
    /**
     * @type {Array.<TaskConfig>}
     */
    this.curTaskConfigs = [];
    this.openSubjects = [];
    this.taskStarNum = 0;
};

Util.inherits(S2CGetCurTask, LogicProtocol);

S2CGetCurTask.prototype.execute = function() {
    TaskMan.getInstance().onGetCurTask(this);
};

S2CGetCurTask.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this, jsonObj)) {
        return;
    }
    this.taskLevel = jsonObj["taskLevel"];
    var curTaskConfigs = jsonObj["curTaskConfigs"];
    for (var i = 0; i < curTaskConfigs.length; ++i) {
        var curTaskConfig = new TaskConfig(curTaskConfigs[i]);
        this.curTaskConfigs.push(curTaskConfig);
    }
    this.openSubjects = jsonObj["openSubjects"];
    this.taskStarNum = jsonObj["taskStarNum"];
};

module.exports = S2CGetCurTask;