var Util = require("../../common/util/Util");
var LogicProtocol = require("../../common/protocol/LogicProtocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var S2CSendMail = require("./S2CSendMail");

var C2SSendMail = function() {
    LogicProtocol.call(this, ProtocolType.Social.C2S_SEND_MAIL);
    this.user_message = "";
    this.email = "";
    this.PT = "";
    this.IAP = "";
    this.bindEmail = 0;
};

Util.inherits(C2SSendMail, LogicProtocol);

module.exports = C2SSendMail;