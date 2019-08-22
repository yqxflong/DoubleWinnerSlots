var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");

var C2SCompleteTask = function () {
    LogicProtocol.call(this, ProtocolType.Task.C2S_COMPLETE_TASK);
    this.taskId = 0;
    this.taskLevelId = 1;
    this.levelStar = 1;
};

Util.inherits(C2SCompleteTask, LogicProtocol);

module.exports = C2SCompleteTask;