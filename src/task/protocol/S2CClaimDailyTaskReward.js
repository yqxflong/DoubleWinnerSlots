var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var DailyTaskReward = require("../entity/DailyTaskReward");
var TaskMan = require("../model/TaskMan");

var S2CClaimDailyTaskReward = function() {
    LogicProtocol.call(this, ProtocolType.Task.S2C_CLAIM_DAILY_TASK_REWARD);
    this.errorCode = 0;
    this.dailyTaskReward = null; //type of DailyTaskReward
};

Util.inherits(S2CClaimDailyTaskReward, LogicProtocol);

S2CClaimDailyTaskReward.prototype.execute = function() {
    TaskMan.getInstance().onClaimDailyTaskReward(this);
};

S2CClaimDailyTaskReward.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    this.dailyTaskReward = new DailyTaskReward();
    if (jsonObj["dailyTaskReward"]) {
        this.dailyTaskReward.unmarshal(jsonObj["dailyTaskReward"]);
    }
};

module.exports = S2CClaimDailyTaskReward;