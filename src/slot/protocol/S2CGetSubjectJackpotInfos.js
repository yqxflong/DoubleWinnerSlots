var Util = require("../../common/util/Util");
var ProtocolType = require("../../common/enum/ProtocolType");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var JackpotStatus = require("../enum/JackpotStatus");
var TimeAccuJackpotInfo = require("../entity/TimeAccuJackpotInfo");
var BetAccuJackpotInfo = require("../entity/BetAccuJackpotInfo");
var JackpotType = require("../enum/JackpotType");
var ClassicSlotMan = require("../model/ClassicSlotMan");

/**
 * Created by alanmars on 15/5/27.
 */
var S2CGetSubjectJackpotInfos = function () {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_GET_SUBJECT_JACKPOT_INFOS);
    this.jackpotType = 0;
    this.subjectId = 0;
    this.jackpotInfoList = [];
};

Util.inherits(S2CGetSubjectJackpotInfos, LogicProtocol);

S2CGetSubjectJackpotInfos.prototype.execute = function () {
    ClassicSlotMan.getInstance().onGetSubjectJackpotInfos(this);
};

S2CGetSubjectJackpotInfos.prototype.unmarshal = function (jsonObj) {
    LogicProtocol.prototype.unmarshal.call(this, jsonObj);
    this.jackpotType = jsonObj["jackpotType"];
    this.subjectId = jsonObj["subjectId"];
    if (jsonObj["jackpotInfoList"]) {
        this.jackpotInfoList = [];
        var jackpotInfoArray = jsonObj["jackpotInfoList"];
        for (var i = 0; i < jackpotInfoArray.length; ++ i) {
            var jackpotInfoObj = jackpotInfoArray[i];
            if (jackpotInfoObj["jackpotType"] === this.jackpotType) {
                if (this.jackpotType === JackpotType.JACKPOT_TYPE_TIME_ACCU) {
                    var jackpotInfo = new TimeAccuJackpotInfo();
                    jackpotInfo.unmarshal(jackpotInfoObj);
                    this.jackpotInfoList.push(jackpotInfo);
                } else if(this.jackpotType === JackpotType.JACKPOT_TYPE_BET_ACCU) {
                    var jackpotInfo = new BetAccuJackpotInfo();
                    jackpotInfo.unmarshal(jackpotInfoObj);
                    this.jackpotInfoList.push(jackpotInfoObj);
                }
            }
        }
    }
};

module.exports = S2CGetSubjectJackpotInfos;