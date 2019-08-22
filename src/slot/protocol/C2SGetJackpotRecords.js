var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

/**
 * Created by alanmars on 15/7/21.
 */
var C2SGetJackpotRecords = function () {
    LogicProtocol.call(this, ProtocolType.Slot.C2S_GET_JACKPOT_RECORDS);
};

Util.inherits(C2SGetJackpotRecords, LogicProtocol);

module.exports = C2SGetJackpotRecords;