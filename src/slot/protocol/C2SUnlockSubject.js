var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");

var C2SUnlockSubject = function() {
    LogicProtocol.call(this, ProtocolType.Slot.C2S_UNLOCK_SUBJECT);
    this.subjectId = 0;
};

Util.inherits(C2SUnlockSubject, LogicProtocol);

module.exports = C2SUnlockSubject;