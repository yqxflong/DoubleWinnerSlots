var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");

/**
 * Created by qinning on 15/4/27.
 */
var C2SSpin = function() {
    LogicProtocol.call(this, ProtocolType.Slot.C2S_SPIN);
    this.bet = 0;
    this.betIndex = -1;
    this.lineNum = 0;
    this.isMaxBet = false;
    this.taskLevelId = -1;
    this.taskId = -1;
    this.levelStar = -1;
};

Util.inherits(C2SSpin, LogicProtocol);

module.exports = C2SSpin;