var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

var C2SLikeUs = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_LIKE_US);
};

Util.inherits(C2SLikeUs, LogicProtocol);

module.exports = C2SLikeUs;