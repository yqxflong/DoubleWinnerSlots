var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var JackpotRecord = require("../entity/JackpotRecord");
var ClassicSlotMan = require("../model/ClassicSlotMan");

/**
 * Created by alanmars on 15/7/21.
 */
var S2CGetJackpotRecords = function () {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_GET_JACKPOT_RECORDS);
    this.jackpotRecords = [];
};

Util.inherits(S2CGetJackpotRecords, LogicProtocol);

S2CGetJackpotRecords.prototype.execute = function () {
    ClassicSlotMan.getInstance().onGetJackpotRecords(this.jackpotRecords);
};

S2CGetJackpotRecords.prototype.unmarshal = function (jsonObj) {
    this.jackpotRecords.length = 0;
    var jackpotRecordArray = jsonObj["jackpotRecords"];
    for (var i = 0; i < jackpotRecordArray.length; ++ i) {
        var jackpotRecord = new JackpotRecord();
        jackpotRecord.unmarshal(jackpotRecordArray[i]);
        this.jackpotRecords.push(jackpotRecord);
    }
};

module.exports = S2CGetJackpotRecords;