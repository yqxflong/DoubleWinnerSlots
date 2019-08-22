var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");

/**
 * Created by qinning on 15/4/24.
 */
var C2SEnterRoom = function() {
    LogicProtocol.call(this, ProtocolType.Slot.C2S_ENTER_ROOM);
    this.roomId = -1;
    this.subjectId = -1;
    this.jackpotId = -1;
    this.taskId = -1;
    this.taskLevelId = -1;
    this.levelStar = -1;
};

Util.inherits(C2SEnterRoom, LogicProtocol);

module.exports = C2SEnterRoom;