var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ClassicSlotMan = require("../model/ClassicSlotMan");

var S2CUnlockSubject = function () {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_UNLOCK_SUBJECT);
    this.errorCode = 0;
    this.costGems = 0;
    this.subjectId = 0;
};

Util.inherits(S2CUnlockSubject, LogicProtocol);

S2CUnlockSubject.prototype.execute = function () {
    ClassicSlotMan.getInstance().onUnlockSubject(this);
};

S2CUnlockSubject.prototype.unmarshal = function (jsonObj) {
    LogicProtocol.prototype.unmarshal.call(this, jsonObj);
    this.costGems = jsonObj["costGems"];
    this.subjectId = jsonObj["subjectId"];
};


module.exports = S2CUnlockSubject;