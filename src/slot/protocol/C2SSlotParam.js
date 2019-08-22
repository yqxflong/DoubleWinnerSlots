var Util = require("../../common/util/Util");
var ProtocolType = require("../../common/enum/ProtocolType");
var LogicProtocol = require("../../common/protocol/LogicProtocol");

/**
 * Created by alanmars on 15/5/27.
 */
var C2SSlotParam = function () {
    LogicProtocol.call(this, ProtocolType.Slot.C2S_SLOT_PARAM);

    this.param1 = 0;
    this.subjectId = 0;
};

Util.inherits(C2SSlotParam, LogicProtocol);

module.exports = C2SSlotParam;