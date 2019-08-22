var Util = require("../../common/util/Util");
var Protocol = require("../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var Player = require("../../common/entity/Player");


var C2SInviteFbFriends = function() {
    Protocol.call(this, ProtocolType.Social.C2S_INVITE_FB_FRIENDS);
    this.fbIdList = null;
};

Util.inherits(C2SInviteFbFriends, Protocol);

module.exports = C2SInviteFbFriends;