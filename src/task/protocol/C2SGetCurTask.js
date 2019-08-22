var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");

var C2SGetCurTask = function () {
    LogicProtocol.call(this, ProtocolType.Task.C2S_GET_CUR_TASK);
};

Util.inherits(C2SGetCurTask, LogicProtocol);

module.exports = C2SGetCurTask;