var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

var C2SGetMails = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_GET_MAILS);
};

Util.inherits(C2SGetMails, LogicProtocol);

module.exports = C2SGetMails;