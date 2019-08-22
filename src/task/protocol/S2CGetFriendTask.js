var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var PlayerTaskInfo = require("../entity/PlayerTaskInfo");
var TaskMan = require("../model/TaskMan");

var S2CGetFriendTask = function() {
    LogicProtocol.call(this, ProtocolType.Task.S2C_GET_FRIEND_TASK);
    this.playerTaskList = []; //array of FriendTaskInfo
};

Util.inherits(S2CGetFriendTask, LogicProtocol);

S2CGetFriendTask.prototype.execute = function() {
    TaskMan.getInstance().onGetFriendsTask(this);
};

S2CGetFriendTask.prototype.unmarshal = function(jsonObj) {
    if(!LogicProtocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    var playerTaskList = jsonObj["playerTaskList"];
    if (playerTaskList) {
        for (var i = 0; i < playerTaskList.length; ++i) {
            var friendTaskInfo = new PlayerTaskInfo();
            friendTaskInfo.unmarshal(playerTaskList[i]);
            this.playerTaskList.push(friendTaskInfo);
        }
    }
};

module.exports = S2CGetFriendTask;