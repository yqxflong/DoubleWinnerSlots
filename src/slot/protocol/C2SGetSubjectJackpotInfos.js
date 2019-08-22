var Util = require("../../common/util/Util");
var ProtocolType = require("../../common/enum/ProtocolType");
var LogicProtocol = require("../../common/protocol/LogicProtocol");

var C2SGetSubjectJackpotInfos = function () {
    LogicProtocol.call(this, ProtocolType.Slot.C2S_GET_SUBJECT_JACKPOT_INFOS);
    this.subjectId = 0;
};

Util.inherits(C2SGetSubjectJackpotInfos, LogicProtocol);

module.exports = C2SGetSubjectJackpotInfos;