var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

var C2SGetSystemMessage = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_GET_SYSTEM_MESSAGE);
};

Util.inherits(C2SGetSystemMessage, LogicProtocol);

module.exports = C2SGetSystemMessage;