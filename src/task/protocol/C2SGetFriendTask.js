var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

var C2SGetFriendTask = function () {
    LogicProtocol.call(this, ProtocolType.Task.C2S_GET_FRIEND_TASK);
    this.fbIds = [];
};

Util.inherits(C2SGetFriendTask, LogicProtocol);

module.exports = C2SGetFriendTask;