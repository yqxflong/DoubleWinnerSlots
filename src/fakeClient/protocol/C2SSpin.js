var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var SlotProtocol = require("./LogicProtocol");

/**
 * Created by qinning on 15/4/27.
 */
var C2SSpin = function() {
    SlotProtocol.call(this, ProtocolType.Slot.C2S_SPIN);
    this.bet = 0;
    this.lineNum = 0;
    this.betGrade = 0;
};




Util.inherits(C2SSpin, SlotProtocol);

module.exports = C2SSpin;