var Util = require("../../common/util/Util");
var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");

var S2CReadMails = function() {
    Protocol.call(this, ProtocolType.Social.S2C_READ_MAILS);
};

Util.inherits(S2CReadMails, Protocol);

module.exports = S2CReadMails;