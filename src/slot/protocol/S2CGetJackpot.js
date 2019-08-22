var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ClassicSlotMan = require("../model/ClassicSlotMan");

/**
 * Created by qinning on 15/4/24.
 */
var S2CGetJackpot = function() {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_GET_JACKPOT);
    this.subjectId = -1;
    this.jackpot = -1;
    this.incPerSec = -1;
};

Util.inherits(S2CGetJackpot, LogicProtocol);

S2CGetJackpot.prototype.execute = function() {
    ClassicSlotMan.getInstance().onGetJackpot(this);
};

S2CGetJackpot.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this,jsonObj)){
        return;
    }
    this.subjectId = jsonObj["subjectId"];
    this.jackpot = jsonObj["jackpot"];
    this.incPerSec = jsonObj["incPerSec"];
};

module.exports = S2CGetJackpot;