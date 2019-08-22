var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");

var C2SReadMails = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_READ_MAILS);
};

Util.inherits(C2SReadMails, LogicProtocol);

module.exports = C2SReadMails;