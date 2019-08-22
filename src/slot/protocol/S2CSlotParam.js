var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
//var ClassicSlotMan = require("../model/ClassicSlotMan");

/**
 * Created by qinning on 15/4/24.
 */
var S2CSlotParam = function() {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_SLOT_PARAM);
};

Util.inherits(S2CSlotParam, LogicProtocol);

S2CSlotParam.prototype.execute = function() {
    //ClassicSlotMan.getInstance().onLeftRoom(this);
};

S2CSlotParam.prototype.unmarshal = function(jsonObj) {
    LogicProtocol.prototype.unmarshal.call(this,jsonObj);
};

module.exports = S2CSlotParam;