var Util = require("../../common/util/Util");
var ProtocolType = require("../../common/enum/ProtocolType");
var LogicProtocol = require("../../common/protocol/LogicProtocol");

/**
 * Created by alanmars on 15/5/27.
 */
var C2SGetSubjects = function () {
    LogicProtocol.call(this, ProtocolType.Slot.C2S_GET_SUBJECTS);
};

Util.inherits(C2SGetSubjects, LogicProtocol);

module.exports = C2SGetSubjects;