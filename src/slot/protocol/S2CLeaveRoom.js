var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ClassicSlotMan = require("../model/ClassicSlotMan");

/**
 * Created by qinning on 15/4/24.
 */
var S2CLeaveRoom = function() {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_LEAVE_ROOM);
};

Util.inherits(S2CLeaveRoom, LogicProtocol);

S2CLeaveRoom.prototype.execute = function() {
    ClassicSlotMan.getInstance().onLeftRoom(this);
};

S2CLeaveRoom.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this,jsonObj)){
        return;
    }
};

module.exports = S2CLeaveRoom;