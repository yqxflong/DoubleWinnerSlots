var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

var C2SGetDailyTask = function () {
    LogicProtocol.call(this, ProtocolType.Task.C2S_GET_DAILY_TASK);
};

Util.inherits(C2SGetDailyTask, LogicProtocol);

module.exports = C2SGetDailyTask;