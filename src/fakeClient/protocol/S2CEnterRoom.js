var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var SlotProtocol = require("./LogicProtocol.js");
var PlayerMan = require("../model/PlayerMan");

/**
 * Created by qinning on 15/4/24.
 */
var S2CEnterRoom = function() {
    SlotProtocol.call(this, ProtocolType.Slot.S2C_ENTER_ROOM);
    this.roomId = -1;
    this.subjectId = -1;
    this.leftFreeSpin = -1;
    this.freeSpinBet = -1;
};

Util.inherits(S2CEnterRoom, SlotProtocol);

S2CEnterRoom.prototype.execute = function(udid) {
    PlayerMan.getInstance().getPlayer(udid).onEnterRoom();
};

S2CEnterRoom.prototype.unmarshal = function(jsonObj) {
    if(!SlotProtocol.prototype.unmarshal.call(this,jsonObj)){
        return;
    }
    this.subjectId = jsonObj["subjectId"];
    this.leftFreeSpin = jsonObj["leftFreeSpin"];
    this.freeSpinBet = jsonObj["freeSpinBet"];
};

module.exports = S2CEnterRoom;