var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

var C2SFbNotiClick = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_FB_NOTI_CLICK);
    this.notiId = null;
};

Util.inherits(C2SFbNotiClick, LogicProtocol);

module.exports = C2SFbNotiClick;