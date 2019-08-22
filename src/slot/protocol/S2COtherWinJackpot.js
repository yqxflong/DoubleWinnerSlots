var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var JackpotRecord = require("../entity/JackpotRecord");
var SlotConfigMan = require("../config/SlotConfigMan");
var JackpotStatus = require("../enum/JackpotStatus");
var ClassicSlotMan = require("../model/ClassicSlotMan");

/**
 * Created by alanmars on 15/7/14.
 */
var S2COtherWinJackpot = function() {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_OTHER_WIN_JACKPOT);
    this.jackpotRecord = null;
    this.jackpotValue = 0;
};

Util.inherits(S2COtherWinJackpot, LogicProtocol);

S2COtherWinJackpot.prototype.execute = function () {
    var self = this;
    var subject = SlotConfigMan.getInstance().getSubject(self.jackpotRecord.subjectId);
    if (subject && subject.jackpotStatus === JackpotStatus.JACKPOT_STATUS_OPEN) {
        subject.jackpotInfoList.forEach(function (jackpotInfo, index, arr) {
            if (jackpotInfo.jackpotId === self.jackpotRecord.jackpotId) {
                jackpotInfo.jackpotValue = self.jackpotValue;
            }
        });

        ClassicSlotMan.getInstance().onOtherWinJackpot(self.jackpotRecord);
    }
};

S2COtherWinJackpot.prototype.unmarshal = function(jsonObj) {
    LogicProtocol.prototype.unmarshal.call(this, jsonObj);
    this.jackpotRecord = new JackpotRecord();
    this.jackpotRecord.unmarshal(jsonObj["jackpotRecord"]);
    this.jackpotValue = jsonObj["jackpotValue"];
};

module.exports = S2COtherWinJackpot;