var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var SlotProtocol = require("./LogicProtocol");

/**
 * Created by qinning on 15/4/24.
 */
var C2SEnterRoom = function() {
    SlotProtocol.call(this, ProtocolType.Slot.C2S_ENTER_ROOM);
    this.roomId = -1;
    this.subjectId = -1;
};

Util.inherits(C2SEnterRoom, SlotProtocol);

module.exports = C2SEnterRoom;