
var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");

/**
 * Created by qinning on 15/4/28.
 */
var C2SLeaveRoom= function() {
    LogicProtocol.call(this, ProtocolType.Slot.C2S_LEAVE_ROOM);
};

Util.inherits(C2SLeaveRoom, LogicProtocol);

module.exports = C2SLeaveRoom;