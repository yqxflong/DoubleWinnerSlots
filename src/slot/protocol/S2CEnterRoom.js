var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var JackpotType = require("../enum/JackpotType");
var BetAccuJackpotSubInfo = require("../entity/BetAccuJackpotSubInfo");
var RoomExtraInfoFactory = require("../entity/RoomExtraInfoFactory");
var TaskInfo = require("../../task/entity/TaskInfo");
var TaskDataFactory = require("../../task/taskData/TaskDataFactory");

/**
 * Created by qinning on 15/4/24.
 */
var S2CEnterRoom = function() {
    LogicProtocol.call(this, ProtocolType.Slot.S2C_ENTER_ROOM);
    this.subjectId = -1;
    this.leftFreeSpin = -1;
    this.freeSpinBet = -1;
    this.freeSpinLineNum = 0;
    this.jackpotSubInfo = null;
    this.roomExtraInfoType = -1;
    this.roomExtraInfo = null;

    this.taskProgress = 0;
    this.taskInfo = null;

    this.taskLeftTime = 0;
    this.taskSpinCount = 0;

    this.taskDetail = null;

    //this.players = [];
};

Util.inherits(S2CEnterRoom, LogicProtocol);

S2CEnterRoom.prototype.execute = function() {
    ClassicSlotMan.getInstance().onEnterRoom(this);
};

S2CEnterRoom.prototype.unmarshal = function(jsonObj) {
    if (!LogicProtocol.prototype.unmarshal.call(this, jsonObj)) {
        return;
    }
    this.subjectId = jsonObj["subjectId"];
    this.leftFreeSpin = jsonObj["leftFreeSpin"];
    this.freeSpinBet = jsonObj["freeSpinBet"];
    this.freeSpinLineNum = jsonObj["freeSpinLineNum"];
    if (jsonObj["jackpotSubInfo"]) {
        this.jackpotSubInfo = new BetAccuJackpotSubInfo();
        this.jackpotSubInfo.unmarshal(jsonObj["jackpotSubInfo"]);
    }
    this.roomExtraInfoType = jsonObj["roomExtraInfoType"];
    this.roomExtraInfo = RoomExtraInfoFactory.create(this.roomExtraInfoType);
    if (this.roomExtraInfo != null) {
        this.roomExtraInfo.unmarshal(jsonObj["roomExtraInfo"]);
    }
    this.taskProgress = jsonObj["taskProgress"];
    var taskInfo = jsonObj["taskInfo"];

    if (taskInfo) {
        this.taskInfo = new TaskInfo();
        this.taskInfo.unmarshal(taskInfo);
    }

    this.taskLeftTime = jsonObj["taskLeftTime"];
    this.taskSpinCount = jsonObj["taskSpinCount"] || 0;

    var taskDetailJsonObj = jsonObj["taskDetail"];
    if (taskDetailJsonObj && this.taskInfo) {
        this.taskDetail = TaskDataFactory.create(this.taskInfo.taskType, taskDetailJsonObj);
    }

    //var playerArr = jsonObj["players"];
    //for (var i = 0; i < playerArr.length; ++ i)
    //{
    //    var player = new SlotPlayer();
    //    player.unmarshal(playerArr[i]);
    //    this.players.push(player);
    //}
};

module.exports = S2CEnterRoom;