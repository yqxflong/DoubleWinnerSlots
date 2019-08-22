var Util = require("../../common/util/Util");
var Protocol = require("./../../common/protocol/Protocol");
var ProtocolType = require("../../common/enum/ProtocolType");
var MailItem = require("../entity/MailItem");
var SendMailType = require("../enum/SendMailType");

var S2CSendMail = function() {
    Protocol.call(this, ProtocolType.Social.S2C_SEND_MAIL);
    this.mailItem = null;
    this.email = null;
    this.bindEmail = 0;
};

Util.inherits(S2CSendMail, Protocol);

S2CSendMail.prototype.execute = function() {
    var MailMan = require("../model/MailMan");
    MailMan.getInstance().onSendMail(this);
};

S2CSendMail.prototype.unmarshal = function(jsonObj) {
    if(!Protocol.prototype.unmarshal.call(this,jsonObj)) {
        return;
    }
    var mailItem = jsonObj["mailItem"];
    if (mailItem) {
        this.mailItem = new MailItem();
        this.mailItem.unmarshal(mailItem);
    } else {
        this.mailItem = null;
    }
    this.email = jsonObj["email"];
    this.bindEmail = jsonObj["bindEmail"] || SendMailType.SEND_MAIL_TYPE_NORMAL;
};

module.exports = S2CSendMail;