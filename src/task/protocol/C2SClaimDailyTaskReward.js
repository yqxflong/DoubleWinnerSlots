var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");

var C2SClaimDailyTaskReward = function () {
    LogicProtocol.call(this, ProtocolType.Task.C2S_CLAIM_DAILY_TASK_REWARD);
};

Util.inherits(C2SClaimDailyTaskReward, LogicProtocol);

module.exports = C2SClaimDailyTaskReward;