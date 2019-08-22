var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");

/**
 * Created by qinning on 15/4/28.
 */
var C2SGetJackpot = function() {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_GET_JACKPOT);
    this.subjectId = -1;
};

Util.inherits(C2SGetJackpot, LogicProtocol);

module.exports = C2SGetJackpot;